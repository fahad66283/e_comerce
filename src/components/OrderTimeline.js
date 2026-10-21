import { formatDate } from "@/context/OrdersContext";

const steps = [
  { status: "Processing", label: "Order placed", icon: "🧾" },
  { status: "Shipped", label: "Shipped", icon: "🚚" },
  { status: "Delivered", label: "Delivered", icon: "📦" },
];

// Progress of an order through Processing → Shipped → Delivered (or Cancelled).
export default function OrderTimeline({ order }) {
  const history = order.statusHistory ?? [{ status: order.status, at: order.createdAt }];
  const when = (status) => [...history].reverse().find((h) => h.status === status)?.at;

  if (order.status === "Cancelled") {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm">
        <p className="font-extrabold text-red-700">✕ This order was cancelled</p>
        {when("Cancelled") && <p className="text-red-700/80">on {formatDate(when("Cancelled"), true)}</p>}
      </div>
    );
  }

  const current = steps.findIndex((s) => s.status === order.status);

  return (
    <ol className="grid grid-cols-3">
      {steps.map((step, i) => {
        const done = i <= current;
        const at = i === 0 ? order.createdAt : when(step.status);
        return (
          <li key={step.status} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 ${i <= current ? "bg-brand-500" : "bg-grey-200"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                done ? "bg-brand-500" : "bg-grey-100 grayscale"
              }`}
              aria-hidden="true"
            >
              {step.icon}
            </span>
            <span className={`mt-2 text-sm font-extrabold ${done ? "" : "text-grey-400"}`}>{step.label}</span>
            <span className="text-xs text-grey-500">{done && at ? formatDate(at) : i === current + 1 ? "Next" : ""}</span>
            <span className="sr-only">{done ? "completed" : "not yet"}</span>
          </li>
        );
      })}
    </ol>
  );
}
