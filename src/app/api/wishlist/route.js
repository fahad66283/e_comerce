import { ok, readJson, requireUser, route } from "@/lib/server/api";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/server/store/wishlist";

// Add one or more products ({ ids: [...] }); also used to merge a guest wishlist after login.
export const POST = route(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);
  await addToWishlist(user.id, Array.isArray(body.ids) ? body.ids : []);
  return ok({ ids: await getWishlist(user.id) });
});

export const DELETE = route(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);
  await removeFromWishlist(user.id, body.id);
  return ok({ ids: await getWishlist(user.id) });
});
