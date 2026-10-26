import { ApiError, ok, route } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { getOrderForViewer } from "@/lib/server/store/orders";
import { refreshStripeOrder } from "@/lib/server/store/payments";

// Order confirmation page: needs the order's secret key, or the owner's/an admin's login.
// After paying on Stripe the page also passes session_id, so the payment is checked right away.
export const GET = route(async (request, { params }) => {
  const { id } = await params;
  const search = request.nextUrl.searchParams;
  const user = await getCurrentUser();
  let order = await getOrderForViewer(id, search.get("key"), user);
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.payment.method === "stripe" && order.payment.status === "Pending" && search.get("session_id")) {
    await refreshStripeOrder(order.id, search.get("session_id"));
    order = await getOrderForViewer(id, search.get("key"), user);
  }
  return ok({ order });
});
