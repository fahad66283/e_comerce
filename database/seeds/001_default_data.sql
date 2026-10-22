-- HAK Store – default data (categories, products, coupons, website content, staff accounts)
-- Generated: 2026-10-22T11:57:41.499Z
--
-- Import this AFTER database/migrations/001_initial_schema.sql (phpMyAdmin → Import).
-- It REPLACES all store data in these tables with the data below.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `order_status_history`;
DELETE FROM `order_items`;
DELETE FROM `orders`;
DELETE FROM `reviews`;
DELETE FROM `wishlists`;
DELETE FROM `product_images`;
DELETE FROM `products`;
DELETE FROM `categories`;
DELETE FROM `coupons`;
DELETE FROM `faqs`;
DELETE FROM `pages`;
DELETE FROM `settings`;
DELETE FROM `users`;

-- Users (passwords are salted PBKDF2-SHA256 hashes; see database/README.md)
INSERT INTO `users` (`id`, `name`, `username`, `email`, `password_hash`, `role`, `status`, `created_at`) VALUES
  (1, 'Fahad Shah', 'fahad shah', 'fahadshah6622@gmail.com', 'pbkdf2_sha256$600000$069d3201b89ea8bfb6420c66d67e8817$32484046a5bb003731f9b237e576736a45800410b434027e80d2b05938cf971b', 'superadmin', 'active', '2026-10-22 11:57:41'),
  (2, 'Admin', NULL, 'kamisofts@gmail.com', 'pbkdf2_sha256$600000$80ea488ad4826ac360b3ae37149a3628$60f3f5939d826759ae20dbce09f3d57401860717303e377f4aa2af63389c5d87', 'admin', 'active', '2026-10-22 11:57:41');

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `description`, `sort_order`) VALUES
  (1, 'Electronics', 'electronics', '🎧', 'Headphones, smart watches, speakers and more.', 0),
  (2, 'Fashion', 'fashion', '👕', 'Everyday clothing and shoes for every style.', 1),
  (3, 'Home', 'home', '🪴', 'Lamps, mugs, plants and décor for your space.', 2),
  (4, 'Accessories', 'accessories', '👜', 'Wallets, bags, sunglasses and finishing touches.', 3);

-- Products
INSERT INTO `products` (`id`, `slug`, `category_id`, `name`, `description`, `price`, `compare_at_price`, `stock`, `emoji`, `rating`, `is_featured`, `is_new`, `status`, `sort_order`) VALUES
  (1, 'wireless-headphones', 1, 'Wireless Headphones', 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.', 4999, NULL, 12, '🎧', 4.6, 1, 0, 'active', 0),
  (2, 'smart-watch', 1, 'Smart Watch', 'Track fitness, heart rate and sleep. Water resistant with a 7-day battery.', 7499, 8999, 8, '⌚', 4.4, 1, 1, 'active', 1),
  (3, 'bluetooth-speaker', 1, 'Bluetooth Speaker', 'Portable speaker with deep bass, 12-hour playtime and splash protection.', 3299, NULL, 20, '🔊', 4.3, 0, 0, 'active', 2),
  (4, 'cotton-tshirt', 2, 'Cotton T-Shirt', '100% soft cotton t-shirt with a regular fit. Available in all sizes.', 1299, NULL, 50, '👕', 4.5, 1, 0, 'active', 3),
  (5, 'running-shoes', 2, 'Running Shoes', 'Lightweight running shoes with cushioned soles for all-day comfort.', 5999, 7499, 15, '👟', 4.7, 1, 0, 'active', 4),
  (6, 'denim-jacket', 2, 'Denim Jacket', 'Classic denim jacket with a modern cut and durable stitching.', 4499, NULL, 10, '🧥', 4.2, 0, 1, 'active', 5),
  (7, 'coffee-mug', 3, 'Ceramic Coffee Mug', '350ml ceramic mug, microwave and dishwasher safe.', 799, NULL, 40, '☕', 4.8, 0, 0, 'active', 6),
  (8, 'table-lamp', 3, 'Table Lamp', 'Minimal LED desk lamp with three brightness levels.', 2499, NULL, 18, '💡', 4.1, 0, 1, 'active', 7),
  (9, 'indoor-plant', 3, 'Indoor Plant', 'Easy-care indoor plant in a ceramic pot. Perfect for desks and shelves.', 1599, NULL, 25, '🪴', 4.6, 1, 0, 'active', 8),
  (10, 'leather-wallet', 4, 'Leather Wallet', 'Slim genuine leather wallet with six card slots.', 1999, 2499, 30, '👛', 4.4, 0, 0, 'active', 9),
  (11, 'sunglasses', 4, 'Sunglasses', 'UV400 polarized sunglasses with a lightweight frame.', 2299, NULL, 22, '🕶️', 4.3, 0, 0, 'active', 10),
  (12, 'backpack', 4, 'Travel Backpack', 'Water-resistant 25L backpack with a padded laptop sleeve.', 3999, NULL, 14, '🎒', 4.5, 1, 1, 'active', 11);

-- Product images (max 5 per product; URL is a file path or a data: URL)
-- (no rows for product_images)

-- Coupons
INSERT INTO `coupons` (`code`, `type`, `value`, `min_order`, `is_active`) VALUES
  ('WELCOME10', 'percent', 10, 0, 1),
  ('SAVE500', 'fixed', 500, 5000, 1);

-- Orders
-- (no rows for orders)

-- Order items
-- (no rows for order_items)

-- Order status history
-- (no rows for order_status_history)

-- Reviews
-- (no rows for reviews)

-- Website settings (JSON per section)
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
  ('general', '{"storeName":"HAK Store","tagline":"Everything you need, in one basket","logo":null,"logoLight":null,"brandColor":"#61C149","darkColor":"#0A0A0A"}'),
  ('announcement', '{"enabled":true,"text":"🚚 **Free shipping** on orders over Rs. 5,000"}'),
  ('contact', '{"eyebrow":"Contact Us","title":"We''re happy to help","text":"Have a question? Send us a message and we''ll reply as soon as possible.","email":"Kamisofts@gmail.com","phone":"+92 300 0000000","address":"Lahore, Pakistan","hours":"Mon – Sat, 9am – 6pm","whatsapp":"923000000000","whatsappMessage":"Hi {storeName}! I have a question."}'),
  ('shipping', '{"fee":250,"freeShippingMin":5000}'),
  ('inventory', '{"lowStock":5}'),
  ('payments', '{"methods":[{"id":"cod","enabled":true,"title":"Cash on Delivery","text":"Pay in cash when your order arrives","details":[]},{"id":"bank","enabled":true,"title":"Bank Transfer","text":"Transfer to our bank account, then enter the transaction ID","details":[{"label":"Bank","value":"Your Bank Name"},{"label":"Account Title","value":"{storeName}"},{"label":"IBAN","value":"PK00 XXXX 0000 0000 0000 0000"}]},{"id":"jazzcash","enabled":true,"title":"JazzCash","text":"Send money to our JazzCash account, then enter the transaction ID","details":[{"label":"JazzCash Number","value":"0300 0000000"},{"label":"Account Title","value":"{storeName}"}]},{"id":"easypaisa","enabled":true,"title":"Easypaisa","text":"Send money to our Easypaisa account, then enter the transaction ID","details":[{"label":"Easypaisa Number","value":"0300 0000000"},{"label":"Account Title","value":"{storeName}"}]}]}'),
  ('home', '{"heroBadge":"✨ Everything you need in one place","heroTitle":"Shop easier.","heroHighlight":"Delivered faster.","heroText":"From electronics and fashion to home goods and accessories — everything you need at {storeName}, delivered to your door.","primaryButton":"Shop Now","secondaryButton":"Popular Picks","trustItems":["🚚 Fast delivery","💵 Cash on delivery","🔄 7-day returns"],"popularEyebrow":"Picked for you","popularTitle":"Most popular this week","popularText":"Hand-picked products from every category.","promos":[{"title":"Deals of the week","text":"Discounts on selected products. New customers get 10% off with code **WELCOME10**.","button":"Shop the Sale","link":"/products?filter=sale"},{"title":"Free Shipping","text":"On all orders over Rs. 5,000, delivered to every city.","button":"Start Shopping","link":"/products"}],"newEyebrow":"Just arrived","newTitle":"New at {storeName}","saleEyebrow":"On sale","saleTitle":"Today''s best deals","features":[{"icon":"🚚","title":"Fast Delivery","text":"To every city within 2–5 working days"},{"icon":"🔒","title":"Secure Shopping","text":"Your details are always protected"},{"icon":"🔄","title":"Easy Returns","text":"Return or exchange within 7 days"},{"icon":"🎧","title":"Friendly Support","text":"Our team is ready to help you"}],"newsletterTitle":"Don''t miss our deals","newsletterText":"Subscribe to our newsletter and get the latest offers first."}'),
  ('listings', '{"shopEyebrow":"Shop","shopTitle":"Browse all products","shopText":"Use the filters below to find what you need quickly.","categoriesEyebrow":"Categories","categoriesTitle":"Shop by category","categoriesText":"Pick a category to explore everything we have in it."}'),
  ('productPage', '{"highlights":["🚚 Free shipping on orders over Rs. 5,000","🔄 7-day easy returns","💵 Cash on delivery available"]}'),
  ('about', '{"eyebrow":"About Us","title":"The {storeName} story","story":"{storeName} started with a simple idea: bring everything you need every day into one online place that combines quality with easy shopping. We work with trusted suppliers to offer a varied range of electronics, fashion, home goods and accessories, with delivery that reaches every city.","values":[{"icon":"✅","title":"Trusted Quality","text":"We choose every product carefully before adding it to the store."},{"icon":"🧭","title":"Wide Selection","text":"From electronics to fashion, everything in one place."},{"icon":"💬","title":"Great Customer Service","text":"Our team is happy to help before and after you buy."}],"stats":[{"value":"10K+","label":"Happy Customers"},{"value":"4","label":"Product Categories"},{"value":"50+","label":"Cities Served"},{"value":"4.7","label":"Customer Rating"},{"value":"6 days","label":"Support Every Week"},{"value":"7","label":"Days to Return"}]}'),
  ('footer', '{"tagline":"Your store for everything you need, delivered to every city.","copyright":"© 2026 {storeName}. All rights reserved.","facebook":"","instagram":"","tiktok":"","youtube":""}');

-- Policy pages
INSERT INTO `pages` (`slug`, `title`, `intro`, `updated_label`, `content`) VALUES
  ('privacy-policy', 'Privacy Policy', 'How {storeName} collects, uses and protects your personal information.', '21 October 2026', '{"highlights":[],"sections":[{"title":"1. Information we collect","body":"- **Account details:** your name, email address and password when you sign up.\\n- **Order details:** your name, phone number, email, delivery address and the items you order.\\n- **Messages:** anything you send us through the contact form.\\n- **Usage data:** basic information about how you use the website, such as pages visited."},{"title":"2. How we use your information","body":"- To process, deliver and support your orders.\\n- To manage your account and show your order history.\\n- To reply to your questions and requests.\\n- To send offers and news, only if you subscribe to our newsletter.\\n- To improve our website and services."},{"title":"3. Sharing your information","body":"We do not sell your personal information. We only share it with delivery partners and service providers who need it to fulfil your order, or when required by law."},{"title":"4. Cookies and local storage","body":"We use cookies and your browser''s local storage to keep you logged in, remember your cart and understand how the website is used. You can clear these at any time in your browser settings."},{"title":"5. Data security","body":"We take reasonable steps to protect your information from loss, misuse and unauthorised access. No method of transmission over the internet is completely secure, however."},{"title":"6. Your rights","body":"You can ask us to access, correct or delete your personal information, or unsubscribe from marketing emails at any time, by [contacting us](/contact)."},{"title":"7. Changes to this policy","body":"We may update this policy from time to time. The latest version will always be on this page with the date it was last updated."}]}'),
  ('terms', 'Terms & Conditions', 'Please read these terms carefully before using {storeName}.', '21 October 2026', '{"highlights":[],"sections":[{"title":"1. About these terms","body":"By using this website or placing an order, you agree to these Terms & Conditions. If you do not agree, please do not use the website."},{"title":"2. Your account","body":"- You must give accurate information when creating an account.\\n- You are responsible for keeping your password safe and for all activity on your account.\\n- We may suspend accounts that are used for fraud or misuse."},{"title":"3. Products and prices","body":"- We try to show products, colours and descriptions as accurately as possible.\\n- Prices are in Pakistani Rupees (Rs.) and may change without notice.\\n- If a product is listed at an incorrect price, we may cancel the order and let you know."},{"title":"4. Orders","body":"Your order is an offer to buy. We may accept or decline it, for example if an item is out of stock. We will contact you if there is a problem with your order."},{"title":"5. Payment","body":"We accept Cash on Delivery, Bank Transfer, JazzCash and Easypaisa. Orders paid by transfer are shipped once the payment is confirmed."},{"title":"6. Delivery","body":"Delivery times are estimates and may vary. Shipping is free on orders over Rs. 5,000; a flat fee applies to smaller orders."},{"title":"7. Returns","body":"Returns and refunds are handled according to our [Return Policy](/return-policy)."},{"title":"8. Limitation of liability","body":"To the extent allowed by law, {storeName} is not liable for indirect or unexpected losses arising from the use of this website or our products."},{"title":"9. Contact","body":"Questions about these terms? Use our [contact page](/contact)."}]}'),
  ('return-policy', 'Return & Refund Policy', 'We want you to love what you buy. If something isn''t right, here''s how returns work.', '21 October 2026', '{"highlights":[{"icon":"📅","title":"7 days","text":"to request a return"},{"icon":"📦","title":"Unused items","text":"in original packaging"},{"icon":"💵","title":"Refund","text":"within 5–7 working days"}],"sections":[{"title":"1. Eligibility","body":"You can return an item within 7 days of delivery if:\\n- It is unused, unwashed and in the same condition you received it.\\n- It is in its original packaging with all tags, accessories and manuals.\\n- You have your order number as proof of purchase."},{"title":"2. Items that cannot be returned","body":"- Personal care and hygiene products once opened.\\n- Items marked as final sale.\\n- Items damaged through misuse after delivery."},{"title":"3. Damaged or wrong items","body":"If your item arrives damaged, faulty or is not what you ordered, contact us within 48 hours of delivery with your order number and photos. We will replace it or refund you in full, including shipping costs."},{"title":"4. How to return an item","body":"- [Contact us](/contact) with your order number and the item you want to return.\\n- We will confirm your return and arrange a pickup or give you a return address.\\n- Pack the item securely in its original packaging."},{"title":"5. Refunds","body":"Once we receive and inspect your return, we will process your refund within 5–7 working days. For Cash on Delivery orders, refunds are made by bank transfer or mobile wallet. Original shipping fees are non-refundable unless the item was damaged or incorrect."},{"title":"6. Exchanges","body":"Want a different size or colour? Request an exchange within 7 days, subject to availability."}]}');

-- FAQs
INSERT INTO `faqs` (`group_name`, `question`, `answer`, `sort_order`) VALUES
  ('Orders & Delivery', 'How long does delivery take?', 'Orders are usually delivered within 2–5 working days, depending on your city.', 0),
  ('Orders & Delivery', 'How much does shipping cost?', 'Shipping is free on orders over Rs. 5,000. Smaller orders have a flat shipping fee of Rs. 250.', 1),
  ('Orders & Delivery', 'How can I track my order?', 'Use [Track Order](/track-order) with your order ID and the email or phone you used at checkout. If you have an account, your orders are also in [My Account](/account).', 2),
  ('Orders & Delivery', 'Can I change or cancel my order?', 'Yes, as long as it hasn''t been shipped yet. Contact us as soon as possible with your order number.', 3),
  ('Payments', 'Which payment methods do you accept?', 'Cash on Delivery, Bank Transfer, JazzCash and Easypaisa. For online transfers, enter your transaction ID at checkout and we''ll confirm your payment.', 4),
  ('Payments', 'Are prices inclusive of taxes?', 'Yes, all prices shown on the website include applicable taxes.', 5),
  ('Returns & Refunds', 'What is your return policy?', 'You can return most items within 7 days of delivery if they are unused and in their original packaging. [Read the full Return Policy](/return-policy).', 6),
  ('Returns & Refunds', 'What if my item arrives damaged?', 'Contact us within 48 hours of delivery with photos of the item and we''ll arrange a replacement or refund.', 7),
  ('Account', 'Do I need an account to order?', 'No, you can check out as a guest. With an account you can see all your orders in one place.', 8),
  ('Account', 'I forgot my password. What should I do?', 'Please contact our support team and we''ll help you get back into your account.', 9);
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
  ('faqs', '{"eyebrow":"Help","title":"Frequently asked questions","intro":"Quick answers to the questions we hear most often."}');

SET FOREIGN_KEY_CHECKS = 1;
