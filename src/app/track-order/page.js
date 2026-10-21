import { Suspense } from "react";
import TrackOrder from "@/components/TrackOrder";

export const metadata = {
  title: "Track Order – HAK Store",
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<p className="container-page py-16 text-grey-500">Loading...</p>}>
      <TrackOrder />
    </Suspense>
  );
}
