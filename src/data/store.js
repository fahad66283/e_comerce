// Store-wide settings. Replace the placeholder numbers and account details with your own.
export const STORE = {
  name: "HAK Store",
  email: "Kamisofts@gmail.com",
  phone: "+92 300 0000000",
  // WhatsApp number in international format, digits only (92 = Pakistan). PLACEHOLDER.
  whatsapp: "923000000000",
};

// Payment methods shown at checkout. Manual methods ask the customer for a transaction ID,
// which the admin verifies before marking the order as paid.
export const PAYMENT_METHODS = [
  {
    id: "cod",
    icon: "💵",
    title: "Cash on Delivery",
    text: "Pay in cash when your order arrives",
  },
  {
    id: "bank",
    icon: "🏦",
    title: "Bank Transfer",
    text: "Transfer to our bank account, then enter the transaction ID",
    manual: true,
    // PLACEHOLDER account details
    details: [
      ["Bank", "Your Bank Name"],
      ["Account Title", "HAK Store"],
      ["IBAN", "PK00 XXXX 0000 0000 0000 0000"],
    ],
  },
  {
    id: "jazzcash",
    icon: "📱",
    title: "JazzCash",
    text: "Send money to our JazzCash account, then enter the transaction ID",
    manual: true,
    details: [["JazzCash Number", "0300 0000000"], ["Account Title", "HAK Store"]],
  },
  {
    id: "easypaisa",
    icon: "📲",
    title: "Easypaisa",
    text: "Send money to our Easypaisa account, then enter the transaction ID",
    manual: true,
    details: [["Easypaisa Number", "0300 0000000"], ["Account Title", "HAK Store"]],
  },
  {
    id: "card",
    icon: "💳",
    title: "Credit / Debit Card",
    text: "Coming soon – needs an online payment gateway",
    disabled: true,
  },
];

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function whatsappLink(message) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
