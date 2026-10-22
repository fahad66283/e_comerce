import { ApiError, ok, route } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { getOrderForViewer } from "@/lib/server/store/orders";

// Order confirmation page: needs the order's secret key, or the owner's/an admin's login.
export const GET = route(async (request, { params }) => {
  const { id } = await params;
  const order = await getOrderForViewer(id, request.nextUrl.searchParams.get("key"), await getCurrentUser());
  if (!order) throw new ApiError(404, "Order not found.");
  return ok({ order });
});
