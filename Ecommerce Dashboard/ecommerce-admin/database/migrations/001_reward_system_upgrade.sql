-- ==================== REWARD SYSTEM UPGRADE MIGRATION ====================
-- This migration adds Shopify-style advanced reward system
-- Run this script to upgrade your reward system

-- ==================== NEW TABLES ====================

-- Reward Settings Table
CREATE TABLE IF NOT EXISTS `reward_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `setting_type` VARCHAR(20) DEFAULT 'string',
  `description` TEXT,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Reward Summary Table
CREATE TABLE IF NOT EXISTS `user_reward_summary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `available_points` INT DEFAULT 0,
  `points_earned` INT DEFAULT 0,
  `points_used` INT DEFAULT 0,
  `points_expired` INT DEFAULT 0,
  `current_tier` VARCHAR(50) DEFAULT 'bronze',
  `lifetime_spend` DECIMAL(12,2) DEFAULT 0,
  `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add missing columns to user_reward_summary if table already exists
SET @dbname = DATABASE();
SET @tablename = 'user_reward_summary';
SET @columnname = 'current_tier';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) DEFAULT ''bronze''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'lifetime_spend';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(12,2) DEFAULT 0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'last_updated';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Reward Point Expiry Queue Table
CREATE TABLE IF NOT EXISTS `reward_point_expiry_queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `transaction_id` INT NOT NULL,
  `points_to_expire` INT NOT NULL,
  `expiry_date` DATE NOT NULL,
  `is_processed` BOOLEAN DEFAULT FALSE,
  `processed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`transaction_id`) REFERENCES `reward_transactions`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_expiry` (`user_id`, `expiry_date`),
  INDEX `idx_processed` (`is_processed`, `expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order Campaign Application Table
CREATE TABLE IF NOT EXISTS `order_campaign_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `campaign_id` INT NOT NULL,
  `points_earned` INT NOT NULL,
  `multiplier_applied` FLOAT DEFAULT 1.0,
  `bonus_points` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`campaign_id`) REFERENCES `reward_campaigns`(`id`) ON DELETE CASCADE,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reward Redemption Rules Table
CREATE TABLE IF NOT EXISTS `reward_redemption_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `min_points` INT DEFAULT 0,
  `max_points` INT NULL,
  `max_percentage_of_order` FLOAT DEFAULT 100.0,
  `points_to_currency_rate` FLOAT DEFAULT 0.01,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== ALTER EXISTING TABLES ====================

-- Add columns to reward_tiers table
SET @dbname = DATABASE();
SET @tablename = 'reward_tiers';
SET @columnname = 'points_earning_rate_multiplier';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' FLOAT DEFAULT 1.0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'free_shipping_threshold';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(12,2) NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'priority_support';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'early_access';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add columns to reward_campaigns table
SET @tablename = 'reward_campaigns';
SET @columnname = 'priority';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT 0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'stackable';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'max_uses_per_user';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'auto_apply';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Modify reward_campaigns.campaign_type ENUM
ALTER TABLE `reward_campaigns` 
MODIFY COLUMN `campaign_type` VARCHAR(50) NOT NULL;

-- Add columns to reward_transactions table
SET @tablename = 'reward_transactions';
SET @columnname = 'order_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL, ADD FOREIGN KEY (', @columnname, ') REFERENCES orders(id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'campaign_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL, ADD FOREIGN KEY (', @columnname, ') REFERENCES reward_campaigns(id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'base_points';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'multiplier_applied';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' FLOAT DEFAULT 1.0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'bonus_points';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT 0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Modify reward_transactions.transaction_type
ALTER TABLE `reward_transactions` 
MODIFY COLUMN `transaction_type` VARCHAR(50) NOT NULL;

-- ==================== INSERT DEFAULT DATA ====================

-- Insert default reward settings
INSERT INTO `reward_settings` (`setting_key`, `setting_value`, `setting_type`, `description`)
VALUES
  ('signup_bonus', '100', 'number', 'Points awarded on user signup'),
  ('spend_threshold', '100', 'number', 'Amount to spend to earn points'),
  ('points_per_threshold', '10', 'number', 'Points earned per threshold amount'),
  ('conversion_rate', '0.10', 'number', 'Points to currency conversion rate'),
  ('max_usage_percent', '10', 'number', 'Maximum percentage of order that can be paid with points'),
  ('expiry_days', '180', 'number', 'Number of days before points expire')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Insert default redemption rule
INSERT INTO `reward_redemption_rules` (`min_points`, `max_points`, `max_percentage_of_order`, `points_to_currency_rate`, `is_active`)
VALUES (100, NULL, 10.0, 0.01, TRUE)
ON DUPLICATE KEY UPDATE `is_active` = TRUE;

-- Create user_reward_summary entries for all existing users
INSERT INTO `user_reward_summary` (`user_id`, `available_points`, `points_earned`, `points_used`, `points_expired`, `current_tier`, `lifetime_spend`)
SELECT 
  u.id,
  COALESCE(SUM(CASE WHEN rt.transaction_type = 'earn' THEN rt.points ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN rt.transaction_type IN ('redeem', 'expire') THEN ABS(rt.points) ELSE 0 END), 0) as available_points,
  COALESCE(SUM(CASE WHEN rt.transaction_type = 'earn' THEN rt.points ELSE 0 END), 0) as points_earned,
  COALESCE(SUM(CASE WHEN rt.transaction_type = 'redeem' THEN ABS(rt.points) ELSE 0 END), 0) as points_used,
  COALESCE(SUM(CASE WHEN rt.transaction_type = 'expire' THEN ABS(rt.points) ELSE 0 END), 0) as points_expired,
  'bronze' as current_tier,
  0 as lifetime_spend
FROM `users` u
LEFT JOIN `reward_transactions` rt ON u.id = rt.user_id
GROUP BY u.id
ON DUPLICATE KEY UPDATE
  `available_points` = (
    SELECT COALESCE(SUM(CASE WHEN rt2.transaction_type = 'earn' THEN rt2.points ELSE 0 END), 0) - 
           COALESCE(SUM(CASE WHEN rt2.transaction_type IN ('redeem', 'expire') THEN ABS(rt2.points) ELSE 0 END), 0)
    FROM `reward_transactions` rt2
    WHERE rt2.user_id = `user_reward_summary`.`user_id`
  ),
  `points_earned` = (
    SELECT COALESCE(SUM(CASE WHEN rt2.transaction_type = 'earn' THEN rt2.points ELSE 0 END), 0)
    FROM `reward_transactions` rt2
    WHERE rt2.user_id = `user_reward_summary`.`user_id`
  ),
  `points_used` = (
    SELECT COALESCE(SUM(CASE WHEN rt2.transaction_type = 'redeem' THEN ABS(rt2.points) ELSE 0 END), 0)
    FROM `reward_transactions` rt2
    WHERE rt2.user_id = `user_reward_summary`.`user_id`
  ),
  `points_expired` = (
    SELECT COALESCE(SUM(CASE WHEN rt2.transaction_type = 'expire' THEN ABS(rt2.points) ELSE 0 END), 0)
    FROM `reward_transactions` rt2
    WHERE rt2.user_id = `user_reward_summary`.`user_id`
  );

-- ==================== CREATE INDEXES ====================

-- Indexes for reward_point_expiry_queue
SET @tablename = 'reward_point_expiry_queue';
SET @indexname = 'idx_user_expiry';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (user_id, expiry_date)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_processed';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (is_processed, expiry_date)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- ==================== MIGRATION COMPLETE ====================
-- All reward system tables and columns have been created/updated
-- The system is now ready for Shopify-style advanced reward management





