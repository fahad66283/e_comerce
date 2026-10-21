// Default website content and settings. The super admin edits all of this from
// Dashboard → Website / Settings; changes are saved on top of these defaults.
//
// Write {storeName} anywhere to insert the store name (Branding → Store name).
//
// Text formatting in long text fields:
//   **bold**, [link text](/page) or [link](https://...), "- " at the start of a line for a bullet,
//   and an empty line between paragraphs.
export const defaultSettings = {
  general: {
    storeName: "HAK Store",
    tagline: "Everything you need, in one basket",
    logo: null, // uploaded image for light backgrounds (header)
    logoLight: null, // uploaded image for the dark footer
    brandColor: "#61C149",
    darkColor: "#0A0A0A",
  },

  announcement: {
    enabled: true,
    text: "🚚 **Free shipping** on orders over Rs. 5,000",
  },

  contact: {
    eyebrow: "Contact Us",
    title: "We're happy to help",
    text: "Have a question? Send us a message and we'll reply as soon as possible.",
    email: "Kamisofts@gmail.com",
    phone: "+92 300 0000000",
    address: "Lahore, Pakistan",
    hours: "Mon – Sat, 9am – 6pm",
    whatsapp: "923000000000", // international format, digits only
    whatsappMessage: "Hi {storeName}! I have a question.",
  },

  shipping: {
    fee: 250,
    freeShippingMin: 5000,
  },

  inventory: {
    lowStock: 5,
  },

  payments: {
    methods: [
      { id: "cod", enabled: true, title: "Cash on Delivery", text: "Pay in cash when your order arrives", details: [] },
      {
        id: "bank",
        enabled: true,
        title: "Bank Transfer",
        text: "Transfer to our bank account, then enter the transaction ID",
        details: [
          { label: "Bank", value: "Your Bank Name" },
          { label: "Account Title", value: "{storeName}" },
          { label: "IBAN", value: "PK00 XXXX 0000 0000 0000 0000" },
        ],
      },
      {
        id: "jazzcash",
        enabled: true,
        title: "JazzCash",
        text: "Send money to our JazzCash account, then enter the transaction ID",
        details: [
          { label: "JazzCash Number", value: "0300 0000000" },
          { label: "Account Title", value: "{storeName}" },
        ],
      },
      {
        id: "easypaisa",
        enabled: true,
        title: "Easypaisa",
        text: "Send money to our Easypaisa account, then enter the transaction ID",
        details: [
          { label: "Easypaisa Number", value: "0300 0000000" },
          { label: "Account Title", value: "{storeName}" },
        ],
      },
    ],
  },

  home: {
    heroBadge: "✨ Everything you need in one place",
    heroTitle: "Shop easier.",
    heroHighlight: "Delivered faster.",
    heroText:
      "From electronics and fashion to home goods and accessories — everything you need at {storeName}, delivered to your door.",
    primaryButton: "Shop Now",
    secondaryButton: "Popular Picks",
    trustItems: ["🚚 Fast delivery", "💵 Cash on delivery", "🔄 7-day returns"],
    popularEyebrow: "Picked for you",
    popularTitle: "Most popular this week",
    popularText: "Hand-picked products from every category.",
    promos: [
      {
        title: "Deals of the week",
        text: "Discounts on selected products. New customers get 10% off with code **WELCOME10**.",
        button: "Shop the Sale",
        link: "/products?filter=sale",
      },
      {
        title: "Free Shipping",
        text: "On all orders over Rs. 5,000, delivered to every city.",
        button: "Start Shopping",
        link: "/products",
      },
    ],
    newEyebrow: "Just arrived",
    newTitle: "New at {storeName}",
    saleEyebrow: "On sale",
    saleTitle: "Today's best deals",
    features: [
      { icon: "🚚", title: "Fast Delivery", text: "To every city within 2–5 working days" },
      { icon: "🔒", title: "Secure Shopping", text: "Your details are always protected" },
      { icon: "🔄", title: "Easy Returns", text: "Return or exchange within 7 days" },
      { icon: "🎧", title: "Friendly Support", text: "Our team is ready to help you" },
    ],
    newsletterTitle: "Don't miss our deals",
    newsletterText: "Subscribe to our newsletter and get the latest offers first.",
  },

  listings: {
    shopEyebrow: "Shop",
    shopTitle: "Browse all products",
    shopText: "Use the filters below to find what you need quickly.",
    categoriesEyebrow: "Categories",
    categoriesTitle: "Shop by category",
    categoriesText: "Pick a category to explore everything we have in it.",
  },

  productPage: {
    highlights: ["🚚 Free shipping on orders over Rs. 5,000", "🔄 7-day easy returns", "💵 Cash on delivery available"],
  },

  about: {
    eyebrow: "About Us",
    title: "The {storeName} story",
    story:
      "{storeName} started with a simple idea: bring everything you need every day into one online place that combines quality with easy shopping. We work with trusted suppliers to offer a varied range of electronics, fashion, home goods and accessories, with delivery that reaches every city.",
    values: [
      { icon: "✅", title: "Trusted Quality", text: "We choose every product carefully before adding it to the store." },
      { icon: "🧭", title: "Wide Selection", text: "From electronics to fashion, everything in one place." },
      { icon: "💬", title: "Great Customer Service", text: "Our team is happy to help before and after you buy." },
    ],
    stats: [
      { value: "10K+", label: "Happy Customers" },
      { value: "4", label: "Product Categories" },
      { value: "50+", label: "Cities Served" },
      { value: "4.7", label: "Customer Rating" },
      { value: "6 days", label: "Support Every Week" },
      { value: "7", label: "Days to Return" },
    ],
  },

  faqs: {
    eyebrow: "Help",
    title: "Frequently asked questions",
    intro: "Quick answers to the questions we hear most often.",
    items: [
      { group: "Orders & Delivery", question: "How long does delivery take?", answer: "Orders are usually delivered within 2–5 working days, depending on your city." },
      { group: "Orders & Delivery", question: "How much does shipping cost?", answer: "Shipping is free on orders over Rs. 5,000. Smaller orders have a flat shipping fee of Rs. 250." },
      { group: "Orders & Delivery", question: "How can I track my order?", answer: "Use [Track Order](/track-order) with your order ID and the email or phone you used at checkout. If you have an account, your orders are also in [My Account](/account)." },
      { group: "Orders & Delivery", question: "Can I change or cancel my order?", answer: "Yes, as long as it hasn't been shipped yet. Contact us as soon as possible with your order number." },
      { group: "Payments", question: "Which payment methods do you accept?", answer: "Cash on Delivery, Bank Transfer, JazzCash and Easypaisa. For online transfers, enter your transaction ID at checkout and we'll confirm your payment." },
      { group: "Payments", question: "Are prices inclusive of taxes?", answer: "Yes, all prices shown on the website include applicable taxes." },
      { group: "Returns & Refunds", question: "What is your return policy?", answer: "You can return most items within 7 days of delivery if they are unused and in their original packaging. [Read the full Return Policy](/return-policy)." },
      { group: "Returns & Refunds", question: "What if my item arrives damaged?", answer: "Contact us within 48 hours of delivery with photos of the item and we'll arrange a replacement or refund." },
      { group: "Account", question: "Do I need an account to order?", answer: "No, you can check out as a guest. With an account you can see all your orders in one place." },
      { group: "Account", question: "I forgot my password. What should I do?", answer: "Please contact our support team and we'll help you get back into your account." },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    intro: "How {storeName} collects, uses and protects your personal information.",
    updated: "21 October 2026",
    highlights: [],
    sections: [
      {
        title: "1. Information we collect",
        body: "- **Account details:** your name, email address and password when you sign up.\n- **Order details:** your name, phone number, email, delivery address and the items you order.\n- **Messages:** anything you send us through the contact form.\n- **Usage data:** basic information about how you use the website, such as pages visited.",
      },
      {
        title: "2. How we use your information",
        body: "- To process, deliver and support your orders.\n- To manage your account and show your order history.\n- To reply to your questions and requests.\n- To send offers and news, only if you subscribe to our newsletter.\n- To improve our website and services.",
      },
      {
        title: "3. Sharing your information",
        body: "We do not sell your personal information. We only share it with delivery partners and service providers who need it to fulfil your order, or when required by law.",
      },
      {
        title: "4. Cookies and local storage",
        body: "We use cookies and your browser's local storage to keep you logged in, remember your cart and understand how the website is used. You can clear these at any time in your browser settings.",
      },
      {
        title: "5. Data security",
        body: "We take reasonable steps to protect your information from loss, misuse and unauthorised access. No method of transmission over the internet is completely secure, however.",
      },
      {
        title: "6. Your rights",
        body: "You can ask us to access, correct or delete your personal information, or unsubscribe from marketing emails at any time, by [contacting us](/contact).",
      },
      {
        title: "7. Changes to this policy",
        body: "We may update this policy from time to time. The latest version will always be on this page with the date it was last updated.",
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    intro: "Please read these terms carefully before using {storeName}.",
    updated: "21 October 2026",
    highlights: [],
    sections: [
      { title: "1. About these terms", body: "By using this website or placing an order, you agree to these Terms & Conditions. If you do not agree, please do not use the website." },
      {
        title: "2. Your account",
        body: "- You must give accurate information when creating an account.\n- You are responsible for keeping your password safe and for all activity on your account.\n- We may suspend accounts that are used for fraud or misuse.",
      },
      {
        title: "3. Products and prices",
        body: "- We try to show products, colours and descriptions as accurately as possible.\n- Prices are in Pakistani Rupees (Rs.) and may change without notice.\n- If a product is listed at an incorrect price, we may cancel the order and let you know.",
      },
      { title: "4. Orders", body: "Your order is an offer to buy. We may accept or decline it, for example if an item is out of stock. We will contact you if there is a problem with your order." },
      { title: "5. Payment", body: "We accept Cash on Delivery, Bank Transfer, JazzCash and Easypaisa. Orders paid by transfer are shipped once the payment is confirmed." },
      { title: "6. Delivery", body: "Delivery times are estimates and may vary. Shipping is free on orders over Rs. 5,000; a flat fee applies to smaller orders." },
      { title: "7. Returns", body: "Returns and refunds are handled according to our [Return Policy](/return-policy)." },
      { title: "8. Limitation of liability", body: "To the extent allowed by law, {storeName} is not liable for indirect or unexpected losses arising from the use of this website or our products." },
      { title: "9. Contact", body: "Questions about these terms? Use our [contact page](/contact)." },
    ],
  },

  returns: {
    title: "Return & Refund Policy",
    intro: "We want you to love what you buy. If something isn't right, here's how returns work.",
    updated: "21 October 2026",
    highlights: [
      { icon: "📅", title: "7 days", text: "to request a return" },
      { icon: "📦", title: "Unused items", text: "in original packaging" },
      { icon: "💵", title: "Refund", text: "within 5–7 working days" },
    ],
    sections: [
      {
        title: "1. Eligibility",
        body: "You can return an item within 7 days of delivery if:\n- It is unused, unwashed and in the same condition you received it.\n- It is in its original packaging with all tags, accessories and manuals.\n- You have your order number as proof of purchase.",
      },
      {
        title: "2. Items that cannot be returned",
        body: "- Personal care and hygiene products once opened.\n- Items marked as final sale.\n- Items damaged through misuse after delivery.",
      },
      {
        title: "3. Damaged or wrong items",
        body: "If your item arrives damaged, faulty or is not what you ordered, contact us within 48 hours of delivery with your order number and photos. We will replace it or refund you in full, including shipping costs.",
      },
      {
        title: "4. How to return an item",
        body: "- [Contact us](/contact) with your order number and the item you want to return.\n- We will confirm your return and arrange a pickup or give you a return address.\n- Pack the item securely in its original packaging.",
      },
      {
        title: "5. Refunds",
        body: "Once we receive and inspect your return, we will process your refund within 5–7 working days. For Cash on Delivery orders, refunds are made by bank transfer or mobile wallet. Original shipping fees are non-refundable unless the item was damaged or incorrect.",
      },
      { title: "6. Exchanges", body: "Want a different size or colour? Request an exchange within 7 days, subject to availability." },
    ],
  },

  footer: {
    tagline: "Your store for everything you need, delivered to every city.",
    copyright: "© 2026 {storeName}. All rights reserved.",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
};

// Merges saved settings over the defaults, so fields added in later versions still get a value.
export function mergeSettings(defaults, saved) {
  if (saved === undefined) return defaults;
  if (Array.isArray(defaults) || defaults === null || typeof defaults !== "object") return saved;
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(saved)) {
    result[key] = key in defaults ? mergeSettings(defaults[key], saved[key]) : saved[key];
  }
  return result;
}

// Replaces {storeName} in every text with the current store name.
export function applyStoreName(value, name) {
  if (typeof value === "string") return value.replaceAll("{storeName}", name);
  if (Array.isArray(value)) return value.map((v) => applyStoreName(v, name));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, applyStoreName(v, name)]));
  }
  return value;
}

export const PAYMENT_ICONS = { cod: "💵", bank: "🏦", jazzcash: "📱", easypaisa: "📲", card: "💳" };

export function whatsappLink(number, message) {
  return `https://wa.me/${String(number).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

// Shipping for an order subtotal (after discount).
export function shippingFor(subtotal, { fee, freeShippingMin }) {
  if (subtotal <= 0 || fee <= 0) return 0;
  return freeShippingMin > 0 && subtotal >= freeShippingMin ? 0 : fee;
}
