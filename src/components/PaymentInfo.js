import { getPaymentMethod } from "@/data/store";

const statusStyles = {
  Pending: "text-amber-700",
  Paid: "text-brand-700",
  Refunded: "text-grey-500",
};

// Payment method, status and reference for an order.
export default function PaymentInfo({ order }) {
  const payment = order.payment;
  const method = getPaymentMethod(payment.method);
  const pendingText =
    payment.method === "cod" ? "Pay on delivery" : "Awaiting payment confirmation";

  return (
    <div className="text-[0.9rem]">
      <p className="text-grey-700">
        {method?.icon} {payment.title}
      </p>
      <p className={`font-bold ${statusStyles[payment.status] ?? ""}`}>
        {payment.status === "Pending" ? pendingText : payment.status}
      </p>
      {payment.reference && <p className="text-xs text-grey-500">Transaction ID: {payment.reference}</p>}
    </div>
  );
}
