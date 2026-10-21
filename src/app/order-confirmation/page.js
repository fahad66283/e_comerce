import { Suspense } from "react";
import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata = {
  title: "Order Confirmation – HAK Store",
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<p className="container-page py-16 text-grey-500">Loading...</p>}>
      <OrderConfirmation />
    </Suspense>
  );
}
