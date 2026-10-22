import { ApiError, ok, readJson, requireStaff, route } from "@/lib/server/api";
import { deleteUnusedImages, saveImage } from "@/lib/server/store/images";

// Upload one photo/logo (multipart form field "file"). Admins upload product photos;
// the logo is changed from the super admin's Website editor.
export const POST = route(async (request) => {
  const user = await requireStaff();
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new ApiError(400, "No file received.");
  if (form.get("purpose") === "logo" && user.role !== "superadmin") throw new ApiError(403, "Only the super admin can change the logo.");
  const url = await saveImage(Buffer.from(await file.arrayBuffer()));
  return ok({ url });
});

// Remove uploads that were never saved (e.g. a cancelled form). Images still in use are kept.
export const DELETE = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await deleteUnusedImages(Array.isArray(body.urls) ? body.urls.slice(0, 50) : []);
  return ok();
});
