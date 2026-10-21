const styles = {
  Processing: "bg-amber-100 text-amber-800",
  Shipped: "bg-sky-100 text-sky-800",
  Delivered: "bg-brand-100 text-brand-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${styles[status] ?? "bg-grey-100"}`}>
      {status}
    </span>
  );
}
