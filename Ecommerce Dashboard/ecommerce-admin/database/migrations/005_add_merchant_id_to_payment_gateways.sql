-- ==================== ADD MERCHANT ID COLUMN TO PAYMENT GATEWAYS ====================
-- Description: Adds merchant_id column for payment gateways that use Merchant ID (like PhonePe)
-- Date: 2026-01-14
-- Compatible with MySQL 5.5+ and MariaDB 10.0+
-- 
-- This script checks if the column exists before adding it to avoid duplicate errors.
-- Run this entire script - it will skip the column if it already exists.

SET @dbname = DATABASE();
SET @tablename = 'payment_gateways';
SET @columnname = 'merchant_id';

-- Check if column exists and add if it doesn't
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(255) DEFAULT NULL COMMENT ''Merchant ID for gateways that require it (e.g., PhonePe)'' AFTER `api_key_public`')
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== MIGRATION COMPLETE ====================
-- 
-- To verify the column was added, run:
-- DESCRIBE payment_gateways;
-- 
-- Note: If you get "Duplicate column name" errors, that column already exists - skip it!







