import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/server/store/orders";

// { status } and/or { paymentStatus }
export const PATCH = route(async (request, { params }) => {
  await requireStaff();
  const { id } = await params;
  const body = await readJson(request);
  if (body.status !== undefined) await updateOrderStatus(id, body.status);
  if (body.paymentStatus !== undefined) await updatePaymentStatus(id, body.paymentStatus);
  return ok();
});
