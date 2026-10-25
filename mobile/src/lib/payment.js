// True while the checkout screen is waiting for Stripe's payment page to send the customer back.
// The return link is then handled by the checkout screen, not opened as a screen by the router.
export const paymentState = { waiting: false };

export const isPaymentReturn = (path) => /(^|\/|:\/\/)payment(\?|$)/.test(path ?? "");
