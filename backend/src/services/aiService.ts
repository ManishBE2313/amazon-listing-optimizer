import openai from '../config/openai';
import { AmazonProductData, OptimizedData, AIPromptResponse } from '../types';

export class AIService {
  
  static async optimizeProductListing(productData: AmazonProductData): Promise<OptimizedData> {
    try {
      const prompt = this.buildOptimizationPrompt(productData);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert Amazon listing optimizer. Your task is to improve product listings by making them keyword-rich, clear, persuasive, and compliant with Amazon's guidelines. Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('No response from AI service');
      }

      const aiResponse: AIPromptResponse = JSON.parse(responseContent);
      
      return {
        optimizedTitle: aiResponse.optimizedTitle || productData.title,
        optimizedBullets: aiResponse.optimizedBullets || productData.bullets,
        optimizedDescription: aiResponse.optimizedDescription || productData.description,
        suggestedKeywords: aiResponse.keywords || []
      };

    } catch (error) {
      console.error('AI optimization error:', error);
      throw new Error(`AI optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static buildOptimizationPrompt(productData: AmazonProductData): string {
    return `
Optimize this Amazon product listing. Respond with valid JSON only.

ORIGINAL PRODUCT DATA:
Title: ${productData.title}

Bullet Points:
${productData.bullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}

Description: ${productData.description}

OPTIMIZATION REQUIREMENTS:
1. Create an optimized title (150-200 characters):
   - Include primary keywords at the beginning
   - Mention key features and benefits
   - Keep it readable and natural
   - Follow format: Brand + Key Feature + Product Type + Important Details

2. Rewrite 5 bullet points (each 150-200 characters):
   - Start with a clear benefit or feature
   - Use persuasive language
   - Include relevant keywords naturally
   - Be specific with measurements, quantities, or technical details
   - Focus on customer benefits

3. Enhance the description (300-500 words):
   - Create a compelling narrative
   - Highlight unique selling points
   - Address customer pain points
   - Include keywords naturally (avoid keyword stuffing)
   - Use persuasive but honest language
   - Ensure Amazon compliance (no promotional language like "best", "cheapest")

4. Suggest 3-5 relevant keywords for SEO:
   - Based on product features
   - Include long-tail keywords
   - Consider search volume potential

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "optimizedTitle": "your optimized title here",
  "optimizedBullets": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3",
    "bullet point 4",
    "bullet point 5"
  ],
  "optimizedDescription": "your enhanced description here",
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5"
  ]
}
`.trim();
  }

  // Alternative method using streaming for large responses
  static async optimizeProductListingStream(productData: AmazonProductData): Promise<OptimizedData> {
    try {
      const prompt = this.buildOptimizationPrompt(productData);
      
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert Amazon listing optimizer. Your task is to improve product listings by making them keyword-rich, clear, persuasive, and compliant with Amazon's guidelines. Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        stream: true
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
      }

      const aiResponse: AIPromptResponse = JSON.parse(fullResponse);
      
      return {
        optimizedTitle: aiResponse.optimizedTitle || productData.title,
        optimizedBullets: aiResponse.optimizedBullets || productData.bullets,
        optimizedDescription: aiResponse.optimizedDescription || productData.description,
        suggestedKeywords: aiResponse.keywords || []
      };

    } catch (error) {
      console.error('AI optimization stream error:', error);
      throw new Error(`AI optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate optimized content
  static validateOptimizedContent(optimized: OptimizedData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!optimized.optimizedTitle || optimized.optimizedTitle.length < 50) {
      errors.push('Optimized title is too short (minimum 50 characters)');
    }

    if (optimized.optimizedTitle.length > 250) {
      errors.push('Optimized title is too long (maximum 250 characters)');
    }

    if (!optimized.optimizedBullets || optimized.optimizedBullets.length < 3) {
      errors.push('Must have at least 3 optimized bullet points');
    }

    if (!optimized.optimizedDescription || optimized.optimizedDescription.length < 200) {
      errors.push('Optimized description is too short (minimum 200 characters)');
    }

    if (!optimized.suggestedKeywords || optimized.suggestedKeywords.length < 3) {
      errors.push('Must have at least 3 keyword suggestions');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
