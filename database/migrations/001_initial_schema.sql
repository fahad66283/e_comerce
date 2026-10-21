-- =====================================================================
-- HAK Store – initial database schema (migration 001)
-- Works on MySQL 8+ and MariaDB 10.4+ (Hostinger).
--
-- Import with phpMyAdmin → select your database → Import → this file.
-- Safe to run more than once (CREATE TABLE IF NOT EXISTS).
-- No CREATE DATABASE, triggers, procedures or DEFINER statements, so it
-- imports on Hostinger shared/business hosting.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tracks which migrations have been applied.
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version`    VARCHAR(100) NOT NULL,
  `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Users: super admin, admins and customers
-- password_hash format: pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100) NOT NULL,
  `username`      VARCHAR(60)  NULL,
  `email`         VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          ENUM('superadmin','admin','customer') NOT NULL DEFAULT 'customer',
  `status`        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(80)  NOT NULL,
  `slug`        VARCHAR(100) NOT NULL,
  `icon`        VARCHAR(16)  NULL,
  `description` VARCHAR(255) NULL,
  `sort_order`  INT NOT NULL DEFAULT 0,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name` (`name`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`             VARCHAR(160) NOT NULL,
  `category_id`      INT UNSIGNED NULL,
  `name`             VARCHAR(200) NOT NULL,
  `description`      TEXT NOT NULL,
  `price`            DECIMAL(12,2) NOT NULL,
  `compare_at_price` DECIMAL(12,2) NULL COMMENT 'Original price when on sale',
  `stock`            INT UNSIGNED NOT NULL DEFAULT 0,
  `emoji`            VARCHAR(16) NULL COMMENT 'Shown when the product has no photos',
  `rating`           DECIMAL(2,1) NOT NULL DEFAULT 0.0 COMMENT 'Starting rating before reviews',
  `is_featured`      TINYINT(1) NOT NULL DEFAULT 0,
  `is_new`           TINYINT(1) NOT NULL DEFAULT 0,
  `status`           ENUM('active','draft') NOT NULL DEFAULT 'active',
  `sort_order`       INT NOT NULL DEFAULT 0,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_flags` (`status`, `is_featured`, `is_new`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_products_price` CHECK (`price` >= 0),
  CONSTRAINT `chk_products_rating` CHECK (`rating` BETWEEN 0 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Up to 5 photos per product (enforced by the application).
-- `url` holds a file path such as /uploads/products/abc.jpg, or a data: URL from the export.
CREATE TABLE IF NOT EXISTS `product_images` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `url`        MEDIUMTEXT NOT NULL,
  `alt`        VARCHAR(200) NULL,
  `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 = main image',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`, `sort_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_product_images_order` CHECK (`sort_order` < 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Discounts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(40) NOT NULL,
  `type`        ENUM('percent','fixed') NOT NULL,
  `value`       DECIMAL(12,2) NOT NULL,
  `min_order`   DECIMAL(12,2) NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `usage_limit` INT UNSIGNED NULL COMMENT 'NULL = unlimited',
  `starts_at`   DATETIME NULL,
  `expires_at`  DATETIME NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`),
  CONSTRAINT `chk_coupons_value` CHECK (`value` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number`      VARCHAR(30)  NOT NULL COMMENT 'e.g. HAK-261021-7K3Q',
  `user_id`           INT UNSIGNED NULL COMMENT 'NULL for guest checkout',
  `is_guest`          TINYINT(1) NOT NULL DEFAULT 1,
  `customer_name`     VARCHAR(120) NOT NULL,
  `customer_email`    VARCHAR(190) NOT NULL,
  `customer_phone`    VARCHAR(40)  NOT NULL,
  `city`              VARCHAR(100) NOT NULL,
  `address`           VARCHAR(255) NOT NULL,
  `notes`             TEXT NULL,
  `subtotal`          DECIMAL(12,2) NOT NULL,
  `discount`          DECIMAL(12,2) NOT NULL DEFAULT 0,
  `coupon_code`       VARCHAR(40) NULL,
  `shipping`          DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total`             DECIMAL(12,2) NOT NULL,
  `status`            ENUM('Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Processing',
  `payment_method`    VARCHAR(30) NOT NULL COMMENT 'cod, bank, jazzcash, easypaisa',
  `payment_title`     VARCHAR(80) NOT NULL,
  `payment_status`    ENUM('Pending','Paid','Refunded') NOT NULL DEFAULT 'Pending',
  `payment_reference` VARCHAR(120) NULL COMMENT 'Transaction ID entered by the customer',
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_email` (`customer_email`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created` (`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items keep a copy of the product name and price at the time of the order.
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`      INT UNSIGNED NOT NULL,
  `product_id`    INT UNSIGNED NULL,
  `product_name`  VARCHAR(200) NOT NULL,
  `product_emoji` VARCHAR(16) NULL,
  `category_name` VARCHAR(80) NULL,
  `unit_price`    DECIMAL(12,2) NOT NULL,
  `quantity`      INT UNSIGNED NOT NULL,
  `line_total`    DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`   INT UNSIGNED NOT NULL,
  `status`     ENUM('Processing','Shipped','Delivered','Cancelled') NOT NULL,
  `note`       VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_history_order` (`order_id`, `created_at`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Customer engagement
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`  INT UNSIGNED NOT NULL,
  `user_id`     INT UNSIGNED NULL,
  `name`        VARCHAR(100) NOT NULL,
  `email`       VARCHAR(190) NULL,
  `rating`      TINYINT UNSIGNED NOT NULL,
  `comment`     TEXT NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Reviewer bought this product',
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`, `is_approved`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wishlists` (
  `user_id`    INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `product_id`),
  KEY `idx_wishlists_product` (`product_id`),
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(120) NOT NULL,
  `email`      VARCHAR(190) NOT NULL,
  `subject`    VARCHAR(200) NOT NULL,
  `message`    TEXT NOT NULL,
  `is_read`    TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_messages_read` (`is_read`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`      VARCHAR(190) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Website content edited by the super admin
-- ---------------------------------------------------------------------
-- One JSON document per section: general, announcement, contact, shipping,
-- inventory, payments, home, listings, productPage, about, faqs, footer.
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key`   VARCHAR(60) NOT NULL,
  `setting_value` LONGTEXT NOT NULL COMMENT 'JSON',
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Policy pages: privacy-policy, terms, return-policy.
CREATE TABLE IF NOT EXISTS `pages` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(80) NOT NULL,
  `title`         VARCHAR(200) NOT NULL,
  `intro`         TEXT NULL,
  `updated_label` VARCHAR(60) NULL COMMENT 'e.g. 21 October 2026',
  `content`       LONGTEXT NOT NULL COMMENT 'JSON: { highlights: [], sections: [{ title, body }] }',
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pages_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_name` VARCHAR(100) NOT NULL DEFAULT 'General',
  `question`   VARCHAR(255) NOT NULL,
  `answer`     TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_faqs_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO `schema_migrations` (`version`) VALUES ('001_initial_schema');
