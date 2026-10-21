// Static product catalog. Replace with a database or API later.
export const categories = ["All", "Electronics", "Fashion", "Home", "Accessories"];

export const categoryInfo = {
  Electronics: { icon: "🎧", description: "Headphones, smart watches, speakers and more." },
  Fashion: { icon: "👕", description: "Everyday clothing and shoes for every style." },
  Home: { icon: "🪴", description: "Lamps, mugs, plants and décor for your space." },
  Accessories: { icon: "👜", description: "Wallets, bags, sunglasses and finishing touches." },
};

export const products = [
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    price: 4999,
    category: "Electronics",
    emoji: "🎧",
    rating: 4.6,
    stock: 12,
    featured: true,
    description:
      "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
  },
  {
    id: "smart-watch",
    name: "Smart Watch",
    price: 7499,
    category: "Electronics",
    emoji: "⌚",
    rating: 4.4,
    stock: 8,
    featured: true,
    description:
      "Track fitness, heart rate and sleep. Water resistant with a 7-day battery.",
  },
  {
    id: "bluetooth-speaker",
    name: "Bluetooth Speaker",
    price: 3299,
    category: "Electronics",
    emoji: "🔊",
    rating: 4.3,
    stock: 20,
    featured: false,
    description: "Portable speaker with deep bass, 12-hour playtime and splash protection.",
  },
  {
    id: "cotton-tshirt",
    name: "Cotton T-Shirt",
    price: 1299,
    category: "Fashion",
    emoji: "👕",
    rating: 4.5,
    stock: 50,
    featured: true,
    description: "100% soft cotton t-shirt with a regular fit. Available in all sizes.",
  },
  {
    id: "running-shoes",
    name: "Running Shoes",
    price: 5999,
    category: "Fashion",
    emoji: "👟",
    rating: 4.7,
    stock: 15,
    featured: true,
    description: "Lightweight running shoes with cushioned soles for all-day comfort.",
  },
  {
    id: "denim-jacket",
    name: "Denim Jacket",
    price: 4499,
    category: "Fashion",
    emoji: "🧥",
    rating: 4.2,
    stock: 10,
    featured: false,
    description: "Classic denim jacket with a modern cut and durable stitching.",
  },
  {
    id: "coffee-mug",
    name: "Ceramic Coffee Mug",
    price: 799,
    category: "Home",
    emoji: "☕",
    rating: 4.8,
    stock: 40,
    featured: false,
    description: "350ml ceramic mug, microwave and dishwasher safe.",
  },
  {
    id: "table-lamp",
    name: "Table Lamp",
    price: 2499,
    category: "Home",
    emoji: "💡",
    rating: 4.1,
    stock: 18,
    featured: false,
    description: "Minimal LED desk lamp with three brightness levels.",
  },
  {
    id: "indoor-plant",
    name: "Indoor Plant",
    price: 1599,
    category: "Home",
    emoji: "🪴",
    rating: 4.6,
    stock: 25,
    featured: true,
    description: "Easy-care indoor plant in a ceramic pot. Perfect for desks and shelves.",
  },
  {
    id: "leather-wallet",
    name: "Leather Wallet",
    price: 1999,
    category: "Accessories",
    emoji: "👛",
    rating: 4.4,
    stock: 30,
    featured: false,
    description: "Slim genuine leather wallet with six card slots.",
  },
  {
    id: "sunglasses",
    name: "Sunglasses",
    price: 2299,
    category: "Accessories",
    emoji: "🕶️",
    rating: 4.3,
    stock: 22,
    featured: false,
    description: "UV400 polarized sunglasses with a lightweight frame.",
  },
  {
    id: "backpack",
    name: "Travel Backpack",
    price: 3999,
    category: "Accessories",
    emoji: "🎒",
    rating: 4.5,
    stock: 14,
    featured: true,
    description: "Water-resistant 25L backpack with a padded laptop sleeve.",
  },
];

export function getProduct(id) {
  return products.find((p) => p.id === id);
}

export function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export const FREE_SHIPPING_MIN = 5000;
export const SHIPPING_FEE = 250;

export function getShipping(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

