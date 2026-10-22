import { route } from "@/lib/server/api";
import { getImage } from "@/lib/server/store/images";

// Serves uploaded photos. Ids never change, so browsers can cache them for a year.
export const GET = route(async (request, { params }) => {
  const { id } = await params;
  const image = await getImage(id);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(image.data, {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
});
