import { ok, route } from "@/lib/server/api";
import { loadStoreData } from "@/lib/server/storeData";

// Everything the mobile app needs to draw the store (same data the website pages get):
// settings, categories, products, ratings, the logged-in user, their wishlist and admin counters.
export const GET = route(async () => ok(await loadStoreData()));
