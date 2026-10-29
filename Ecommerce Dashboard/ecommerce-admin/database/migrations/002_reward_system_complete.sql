-- ==================== REWARD SYSTEM COMPLETE MIGRATION ====================
-- This migration completes the Shopify-style reward system implementation
-- Run this script to add missing columns and features

-- ==================== ADD LOCKED POINTS COLUMN ====================

-- Add locked_points to user_reward_summary
SET @dbname = DATABASE();
SET @tablename = 'user_reward_summary';
SET @columnname = 'locked_points';

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

-- ==================== ADD PRODUCT EXCLUSION COLUMNS ====================

-- Add exclude_from_reward_earning to products
SET @tablename = 'products';
SET @columnname = 'exclude_from_reward_earning';

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

-- Add exclude_from_reward_redemption to products
SET @columnname = 'exclude_from_reward_redemption';

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

-- ==================== UPDATE REWARD TRANSACTIONS FOR NEW TYPES ====================

-- Ensure transaction_type can handle new types: 'lock', 'unlock', 'reverse', 'restore', 'expired_restore'
-- The column is already VARCHAR(50) from previous migration, so no change needed

-- ==================== ADD BASE CURRENCY SETTING ====================

-- Add base_currency to reward_settings if not exists
INSERT INTO `reward_settings` (`setting_key`, `setting_value`, `setting_type`, `description`)
VALUES ('base_currency', 'INR', 'string', 'Base currency for reward point calculations')
ON DUPLICATE KEY UPDATE `setting_value` = 'INR';

-- ==================== ADD MINIMUM ORDER VALUE FOR REDEMPTION ====================

-- Add min_order_value_for_redemption to reward_settings
INSERT INTO `reward_settings` (`setting_key`, `setting_value`, `setting_type`, `description`)
VALUES ('min_order_value_for_redemption', '0', 'number', 'Minimum order value required to use reward points')
ON DUPLICATE KEY UPDATE `setting_value` = '0';

-- ==================== CREATE INDEXES FOR PERFORMANCE ====================

-- Index on reward_transactions for order lookups
SET @tablename = 'reward_transactions';
SET @indexname = 'idx_order_transaction_type';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (order_id, transaction_type)')
));

PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Index on products for exclusion lookups
SET @tablename = 'products';
SET @indexname = 'idx_reward_exclusions';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (exclude_from_reward_earning, exclude_from_reward_redemption)')
));

PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- ==================== MIGRATION COMPLETE ====================
-- All required columns and indexes have been added
-- The reward system is now ready for complete Shopify-style implementation













