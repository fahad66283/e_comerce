import { PAYMENT_ICONS } from "@/data/siteContent";

const statusStyles = {
  Pending: "text-amber-700",
  Paid: "text-brand-700",
  Refunded: "text-grey-500",
};

// Payment method, status and reference for an order.
export default function PaymentInfo({ order }) {
  const payment = order.payment;
  const pendingText =
    payment.method === "cod" ? "Pay on delivery" : payment.method === "stripe" ? "Waiting for card payment" : "Awaiting payment confirmation";

  return (
    <div className="text-[0.9rem]">
      <p className="text-grey-700">
        {PAYMENT_ICONS[payment.method] ?? "💳"} {payment.title}
      </p>
      <p className={`font-bold ${statusStyles[payment.status] ?? ""}`}>
        {payment.status === "Pending" ? pendingText : payment.status}
      </p>
      {payment.reference && (
        <p className="text-xs text-grey-500">
          {payment.method === "stripe" ? "Stripe payment ID" : "Transaction ID"}: {payment.reference}
        </p>
      )}
    </div>
  );
}
