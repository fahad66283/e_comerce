import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { deleteCoupon, listCoupons, saveCoupon } from "@/lib/server/store/coupons";

export const GET = route(async () => {
  await requireStaff();
  return ok({ coupons: await listCoupons() });
});

// Create ({ code, type, value, minOrder, active }) or edit (same plus originalCode).
export const POST = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await saveCoupon(body, body.originalCode || null);
  return ok();
});

export const DELETE = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await deleteCoupon(body.code);
  return ok();
});
