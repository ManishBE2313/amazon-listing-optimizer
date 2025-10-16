CREATE DATABASE IF NOT EXISTS amazon_listing_optimizer;

USE amazon_listing_optimizer;

CREATE TABLE IF NOT EXISTS optimizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  
  -- Original data from Amazon
  original_title TEXT,
  original_bullets JSON,
  original_description TEXT,
  
  -- AI-optimized data
  optimized_title TEXT,
  optimized_bullets JSON,
  optimized_description TEXT,
  suggested_keywords JSON,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_asin (asin),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS optimization_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  optimization_id INT,
  field_name VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (optimization_id) REFERENCES optimizations(id) ON DELETE CASCADE,
  INDEX idx_asin_history (asin)
);
