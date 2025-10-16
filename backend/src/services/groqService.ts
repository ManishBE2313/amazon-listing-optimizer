import Groq from 'groq-sdk';
import { AmazonProductData, OptimizedData, AIPromptResponse } from '../types';

export class GroqService {
  private static groq: Groq;

  static initialize(): void {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not defined in environment variables');
    }
    
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    console.log('✅ Groq AI initialized');
  }

  static async optimizeProductListing(productData: AmazonProductData): Promise<OptimizedData> {
    try {
      if (!this.groq) {
        this.initialize();
      }

      const prompt = this.buildOptimizationPrompt(productData);
      
      console.log('🚀 Sending to Groq AI (llama-3.1-70b)...');
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Amazon product listing optimizer. You always respond with valid JSON only, no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content || '';
      
      console.log('✅ Received response from Groq AI');
      console.log('Response length:', responseText.length);
      
      const aiResponse: AIPromptResponse = JSON.parse(responseText);
      
      // Validate response structure
      if (!aiResponse.optimizedTitle || !aiResponse.optimizedBullets || 
          !aiResponse.optimizedDescription || !aiResponse.keywords) {
        throw new Error('AI response missing required fields');
      }
      
      console.log('✅ AI response validated successfully');
      
      return {
        optimizedTitle: aiResponse.optimizedTitle,
        optimizedBullets: aiResponse.optimizedBullets,
        optimizedDescription: aiResponse.optimizedDescription,
        suggestedKeywords: aiResponse.keywords
      };

    } catch (error: any) {
      console.error('❌ Groq AI Error:', error);
      throw new Error(`Groq AI failed: ${error.message || 'Unknown error'}`);
    }
  }

  private static buildOptimizationPrompt(productData: AmazonProductData): string {
    const bullets = productData.bullets.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n');
    
    return `You are an expert Amazon listing optimizer. Analyze and optimize this product listing.

ORIGINAL PRODUCT:
Title: ${productData.title}

Bullet Points:
${bullets}

Description: ${productData.description}

TASK: Create optimized version with these requirements:

1. OPTIMIZED TITLE (150-200 characters):
   - Place high-value keywords at the beginning
   - Include brand, key features, and product type
   - Make it readable and compelling
   - Follow Amazon best practices

2. OPTIMIZED BULLET POINTS (exactly 5 bullets, each 150-200 characters):
   - Start each with a BENEFIT in CAPITAL LETTERS
   - Include specific details and measurements
   - Focus on customer value and problem-solving
   - Use persuasive, clear language
   - Naturally incorporate relevant keywords

3. ENHANCED DESCRIPTION (300-500 words):
   - Write compelling narrative about the product
   - Highlight unique selling points and benefits
   - Address customer pain points
   - Use natural keyword integration (no stuffing)
   - Maintain Amazon compliance (no superlatives like "best", "cheapest")
   - Create engaging, persuasive content

4. KEYWORD SUGGESTIONS (exactly 5 keyword phrases):
   - Extract from product features and benefits
   - Include long-tail keywords
   - Focus on search intent and relevance

IMPORTANT: Return ONLY a JSON object in this EXACT format with no other text:

{
  "optimizedTitle": "your optimized title here",
  "optimizedBullets": [
    "BENEFIT 1: detailed bullet point with value proposition",
    "BENEFIT 2: detailed bullet point with specific features",
    "BENEFIT 3: detailed bullet point with measurements or specs",
    "BENEFIT 4: detailed bullet point addressing customer needs",
    "BENEFIT 5: detailed bullet point with unique selling point"
  ],
  "optimizedDescription": "your complete enhanced description here as continuous text",
  "keywords": [
    "keyword phrase 1",
    "keyword phrase 2",
    "keyword phrase 3",
    "keyword phrase 4",
    "keyword phrase 5"
  ]
}`;
  }

  static validateOptimizedContent(optimized: OptimizedData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!optimized.optimizedTitle || optimized.optimizedTitle.length < 50) {
      errors.push('Optimized title too short (minimum 50 characters)');
    }

    if (optimized.optimizedTitle && optimized.optimizedTitle.length > 250) {
      errors.push('Optimized title too long (maximum 250 characters)');
    }

    if (!optimized.optimizedBullets || optimized.optimizedBullets.length < 3) {
      errors.push('Need at least 3 bullet points');
    }

    if (!optimized.optimizedDescription || optimized.optimizedDescription.length < 200) {
      errors.push('Description too short (minimum 200 characters)');
    }

    if (!optimized.suggestedKeywords || optimized.suggestedKeywords.length < 3) {
      errors.push('Need at least 3 keywords');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
