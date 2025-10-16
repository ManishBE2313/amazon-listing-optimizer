export interface AmazonProductData {
  asin: string;
  title: string;
  bullets: string[];
  description: string;
}

export interface OptimizedData {
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  suggestedKeywords: string[];
}

export interface OptimizationRecord {
  id?: number;
  asin: string;
  originalTitle: string;
  originalBullets: string[];
  originalDescription: string;
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  suggestedKeywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OptimizationHistory {
  id?: number;
  asin: string;
  optimizationId: number;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedAt?: Date;
}

export interface AIPromptResponse {
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  keywords: string[];
}

