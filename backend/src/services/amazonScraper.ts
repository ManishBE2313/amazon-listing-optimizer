import puppeteer from 'puppeteer';
import { AmazonProductData } from '../types';

export class AmazonScraperService {
  
  // Support multiple Amazon regions
  private static readonly AMAZON_DOMAINS = {
    US: 'https://www.amazon.com/dp/',
    IN: 'https://www.amazon.in/dp/',
    UK: 'https://www.amazon.co.uk/dp/',
    CA: 'https://www.amazon.ca/dp/',
  };

  static async scrapeProduct(asin: string, region: 'US' | 'IN' | 'UK' | 'CA' = 'IN'): Promise<AmazonProductData> {
    const baseUrl = this.AMAZON_DOMAINS[region];
    const url = `${baseUrl}${asin}`;
    
    console.log(`🌐 Fetching from Amazon ${region}: ${url}`);
    
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      const page = await browser.newPage();
      
      // Set realistic headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });

      // Block unnecessary resources to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log('⏳ Loading page...');
      
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Wait a bit for JavaScript to execute
      await new Promise(resolve => setTimeout(resolve, 3000));


      // Check if page loaded correctly
      const pageTitle = await page.title();
      
      if (pageTitle.toLowerCase().includes('page not found') || 
          pageTitle.toLowerCase().includes('404') ||
          pageTitle === 'Amazon') {
        throw new Error(`Product with ASIN ${asin} not found on Amazon ${region}`);
      }

      console.log('✅ Page loaded:', pageTitle.substring(0, 60));

      // Extract product data
      const productData = await page.evaluate(() => {
        const getTextContent = (selector: string): string => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        const getAllTextContents = (selector: string): string[] => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements)
            .map((el: Element) => el.textContent?.trim() || '')
            .filter(text => text.length > 20 && !text.toLowerCase().includes('see more'));
        };

        // Extract title - try multiple selectors
        const title = getTextContent('#productTitle') || 
                     getTextContent('h1#title') ||
                     getTextContent('span#productTitle') ||
                     getTextContent('h1.product-title');

        // Extract bullet points - try multiple selectors
        let bullets: string[] = [];
        
        const bulletSelectors = [
          '#feature-bullets ul li span.a-list-item',
          '#feature-bullets li span',
          'div#feature-bullets ul li',
          '#featurebullets_feature_div li span',
          'ul.a-unordered-list.a-vertical li span'
        ];

        for (const selector of bulletSelectors) {
          bullets = getAllTextContents(selector);
          if (bullets.length > 0) break;
        }

        // Extract description
        let description = getTextContent('#productDescription') ||
                         getTextContent('div#productDescription p') ||
                         getTextContent('#feature-bullets + div') ||
                         getTextContent('div[data-feature-name="productDescription"]');

        // If no description, try meta tag
        if (!description || description.length < 50) {
          const metaDesc = document.querySelector('meta[name="description"]');
          description = metaDesc?.getAttribute('content') || '';
        }

        // If still no description, use first few bullets
        if (!description && bullets.length > 0) {
          description = bullets.slice(0, 3).join(' ');
        }

        return { title, bullets, description };
      });

      await browser.close();

      // Validate extracted data
      if (!productData.title || productData.title.length < 10) {
        throw new Error('Could not extract product title. The ASIN may be invalid or the product page structure is different.');
      }

      console.log('✅ Successfully extracted:');
      console.log(`   Title: ${productData.title.substring(0, 60)}...`);
      console.log(`   Bullets: ${productData.bullets.length} items`);
      console.log(`   Description: ${productData.description.length} chars`);

      return {
        asin,
        title: productData.title,
        bullets: productData.bullets.length > 0 ? productData.bullets.slice(0, 8) : ['Product features not available'],
        description: productData.description || 'Product description not available'
      };

    } catch (error: any) {
      if (browser) {
        await browser.close();
      }
      
      console.error('❌ Scraping error:', error.message);
      
      if (error.message.includes('timeout')) {
        throw new Error('Page load timeout. Please try again.');
      }
      
      throw new Error(`Failed to fetch product from Amazon ${region}: ${error.message}`);
    }
  }

  static validateAsin(asin: string): boolean {
    const cleaned = asin.replace(/[\u200B-\u200D\uFEFF\u202C\u202A\u202B\u202D\u202E]/g, '').trim();
    const asinRegex = /^[A-Z0-9]{10}$/;
    return asinRegex.test(cleaned);
  }
}
