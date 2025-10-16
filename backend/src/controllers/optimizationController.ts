import { Request, Response } from 'express';
import { AmazonScraperService } from '../services/amazonScraper';
import { GroqService } from '../services/groqService';
import { OptimizationModel } from '../models/Optimization';
import { OptimizationRecord } from '../types';

export class OptimizationController {
  
  static async optimizeProduct(req: Request, res: Response): Promise<void> {
    try {
      const { asin } = req.body;

      if (!asin) {
        res.status(400).json({ success: false, error: 'ASIN is required' });
        return;
      }

      let cleanAsin = typeof asin === 'string' ? asin : String(asin);
      cleanAsin = cleanAsin.replace(/[^A-Z0-9]/gi, '').trim().toUpperCase();
      
      if (!AmazonScraperService.validateAsin(cleanAsin)) {
        res.status(400).json({ success: false, error: 'Invalid ASIN format. Must be 10 alphanumeric characters.' });
        return;
      }

      // Fetch from Amazon India (change 'IN' to 'US', 'UK', 'CA' for other regions)
      console.log(`📦 Fetching product from Amazon India - ASIN: ${cleanAsin}`);
      const productData = await AmazonScraperService.scrapeProduct(cleanAsin, 'IN');

      // Use Groq AI to optimize
      console.log('🤖 Optimizing with Groq AI...');
      const optimizedData = await GroqService.optimizeProductListing(productData);

      // Validate optimized content
      const validation = GroqService.validateOptimizedContent(optimizedData);
      if (!validation.valid) {
        console.warn('⚠️ Validation warnings:', validation.errors);
      }

      // Save to database
      const record: OptimizationRecord = {
        asin: cleanAsin,
        originalTitle: productData.title,
        originalBullets: productData.bullets,
        originalDescription: productData.description,
        optimizedTitle: optimizedData.optimizedTitle,
        optimizedBullets: optimizedData.optimizedBullets,
        optimizedDescription: optimizedData.optimizedDescription,
        suggestedKeywords: optimizedData.suggestedKeywords
      };

      const optimizationId = await OptimizationModel.create(record);
      console.log(`✅ Optimization saved with ID: ${optimizationId}`);

      res.status(200).json({
        success: true,
        data: {
          id: optimizationId,
          asin: cleanAsin,
          original: {
            title: productData.title,
            bullets: productData.bullets,
            description: productData.description
          },
          optimized: {
            title: optimizedData.optimizedTitle,
            bullets: optimizedData.optimizedBullets,
            description: optimizedData.optimizedDescription,
            keywords: optimizedData.suggestedKeywords
          },
          validationWarnings: validation.errors
        }
      });

    } catch (error) {
      console.error('❌ Optimization error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  static async getHistoryByAsin(req: Request, res: Response): Promise<void> {
    try {
      const { asin } = req.params;
      
      if (!asin) {
        res.status(400).json({ 
          success: false, 
          error: 'ASIN is required' 
        });
        return;
      }
      
      const optimizations = await OptimizationModel.findByAsin(asin);
      
      res.status(200).json({ 
        success: true, 
        data: { 
          asin, 
          count: optimizations.length, 
          optimizations 
        } 
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  static async getOptimizationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ 
          success: false, 
          error: 'Optimization ID is required' 
        });
        return;
      }
      
      const optimization = await OptimizationModel.findById(parseInt(id));
      
      if (!optimization) {
        res.status(404).json({ 
          success: false, 
          error: 'Optimization not found' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        data: optimization 
      });
    } catch (error) {
      console.error('Get optimization error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  static async getAllOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const optimizations = await OptimizationModel.getAll();
      
      res.status(200).json({ 
        success: true, 
        data: { 
          count: optimizations.length, 
          optimizations 
        } 
      });
    } catch (error) {
      console.error('Get all optimizations error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  static async getChangeHistory(req: Request, res: Response): Promise<void> {
    try {
      const { asin } = req.params;
      
      if (!asin) {
        res.status(400).json({ 
          success: false, 
          error: 'ASIN is required' 
        });
        return;
      }
      
      const history = await OptimizationModel.getHistory(asin);
      
      res.status(200).json({ 
        success: true, 
        data: { 
          asin, 
          count: history.length, 
          history 
        } 
      });
    } catch (error) {
      console.error('Get change history error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
}
