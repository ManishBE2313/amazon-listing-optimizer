import pool from '../config/database';
import { OptimizationRecord } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface OptimizationHistoryItem {
  id: number;
  asin: string;
  optimizedTitle: string;
  optimizedBullets: string[];
  optimizedDescription: string;
  suggestedKeywords: string[];
  createdAt: Date;
}

export class OptimizationModel {
  
  static async create(record: OptimizationRecord): Promise<number> {
    const query = `
      INSERT INTO optimizations (
        asin, 
        original_title, 
        original_bullets, 
        original_description,
        optimized_title,
        optimized_bullets,
        optimized_description,
        suggested_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      record.asin,
      record.originalTitle,
      JSON.stringify(record.originalBullets),
      record.originalDescription,
      record.optimizedTitle,
      JSON.stringify(record.optimizedBullets),
      record.optimizedDescription,
      JSON.stringify(record.suggestedKeywords)
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.insertId;
  }

  static async findByAsin(asin: string): Promise<OptimizationRecord[]> {
    const query = `
      SELECT * FROM optimizations 
      WHERE asin = ? 
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [asin]);
    
    return rows.map((row: RowDataPacket) => this.parseOptimizationRow(row));
  }

  static async findById(id: number): Promise<OptimizationRecord | null> {
    const query = 'SELECT * FROM optimizations WHERE id = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    return this.parseOptimizationRow(rows[0]);
  }

  static async getAll(): Promise<OptimizationRecord[]> {
    const query = `
      SELECT * FROM optimizations 
      ORDER BY created_at DESC 
      LIMIT 100
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);
    
    return rows.map((row: RowDataPacket) => this.parseOptimizationRow(row));
  }

  static async getHistory(asin: string): Promise<OptimizationHistoryItem[]> {
    const query = `
      SELECT 
        id,
        asin,
        optimized_title,
        optimized_bullets,
        optimized_description,
        suggested_keywords,
        created_at
      FROM optimizations 
      WHERE asin = ? 
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [asin]);
    
    return rows.map((row: RowDataPacket) => ({
      id: row.id,
      asin: row.asin,
      optimizedTitle: row.optimized_title,
      optimizedBullets: this.safeJSONParse(row.optimized_bullets, []),
      optimizedDescription: row.optimized_description,
      suggestedKeywords: this.safeJSONParse(row.suggested_keywords, []),
      createdAt: row.created_at
    }));
  }

  private static parseOptimizationRow(row: RowDataPacket): OptimizationRecord {
    return {
      id: row.id,
      asin: row.asin,
      originalTitle: row.original_title,
      originalBullets: this.safeJSONParse(row.original_bullets, []),
      originalDescription: row.original_description,
      optimizedTitle: row.optimized_title,
      optimizedBullets: this.safeJSONParse(row.optimized_bullets, []),
      optimizedDescription: row.optimized_description,
      suggestedKeywords: this.safeJSONParse(row.suggested_keywords, []),
      createdAt: row.created_at
    };
  }

  private static safeJSONParse<T>(jsonString: string | any, fallback: T): T {
    try {
      // Handle if it's already an object
      if (typeof jsonString === 'object') {
        return jsonString as T;
      }

      // Handle null or undefined
      if (!jsonString) {
        return fallback;
      }

      // Clean the string - remove problematic Unicode characters
      const cleanString = String(jsonString)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();

      return JSON.parse(cleanString) as T;
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.error('Problematic string:', String(jsonString).substring(0, 100));
      
      // If it looks like an array string, try to extract it
      if (typeof jsonString === 'string' && jsonString.includes('[')) {
        try {
          const match = jsonString.match(/\[.*\]/s);
          if (match) {
            return JSON.parse(match[0]) as T;
          }
        } catch (e) {
          console.error('Failed to extract array:', e);
        }
      }
      
      return fallback;
    }
  }
}
