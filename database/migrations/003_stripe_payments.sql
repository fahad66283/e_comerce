-- =====================================================================
-- HAK Store – migration 003: Stripe card payments
--   • orders.stripe_session_id – the Stripe Checkout session of a card order
--
-- The app applies this automatically on start-up. To run it by hand,
-- import it in phpMyAdmin after 002_server_features.sql. Safe to re-run.
-- =====================================================================

SET NAMES utf8mb4;

SET @exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'stripe_session_id');
SET @sql := IF(@exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `stripe_session_id` VARCHAR(255) NULL COMMENT ''Stripe Checkout session (card payments)'' AFTER `payment_reference`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_stripe_session');
SET @sql := IF(@exists = 0,
  'ALTER TABLE `orders` ADD KEY `idx_orders_stripe_session` (`stripe_session_id`)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO `schema_migrations` (`version`) VALUES ('003_stripe_payments');
