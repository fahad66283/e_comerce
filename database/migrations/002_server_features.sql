-- =====================================================================
-- HAK Store – migration 002: features used by the live server
--   • images table   – uploaded product photos and logos
--   • sessions table – logins (secure cookie sessions)
--   • orders.access_key, orders.is_demo, order_items.product_image
--
-- The app applies this automatically on start-up. To run it by hand,
-- import it in phpMyAdmin after 001_initial_schema.sql. Safe to re-run.
-- =====================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `images` (
  `id`         CHAR(24) NOT NULL,
  `mime`       VARCHAR(40) NOT NULL,
  `size`       INT UNSIGNED NOT NULL,
  `data`       MEDIUMBLOB NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Only a SHA-256 hash of each session token is stored.
CREATE TABLE IF NOT EXISTS `sessions` (
  `token_hash` CHAR(64) NOT NULL,
  `user_id`    INT UNSIGNED NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns only if they don't exist yet (works on MySQL and MariaDB).
SET @exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'access_key');
SET @sql := IF(@exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `access_key` CHAR(32) NULL COMMENT ''Secret for the order confirmation link'' AFTER `order_number`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'is_demo');
SET @sql := IF(@exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `is_demo` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Sample order for the sales report'' AFTER `payment_reference`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_image');
SET @sql := IF(@exists = 0,
  'ALTER TABLE `order_items` ADD COLUMN `product_image` VARCHAR(255) NULL AFTER `product_emoji`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO `schema_migrations` (`version`) VALUES ('002_server_features');
