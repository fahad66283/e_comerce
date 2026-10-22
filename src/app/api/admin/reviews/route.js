import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { deleteReview, listAllReviews } from "@/lib/server/store/reviews";

export const GET = route(async () => {
  await requireStaff();
  return ok({ reviews: await listAllReviews() });
});

export const DELETE = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await deleteReview(body.id);
  return ok();
});
