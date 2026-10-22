import "server-only";
import { getCurrentUser, isStaff } from "./auth";
import { listCategories, listProducts } from "./store/catalog";
import { countUnreadMessages } from "./store/messages";
import { countPendingOrders } from "./store/orders";
import { getRatings } from "./store/reviews";
import { getSavedSettings } from "./store/settings";
import { getWishlist } from "./store/wishlist";

// Everything the pages need, loaded once per request and handed to the client providers.
export async function loadStoreData() {
  const user = await getCurrentUser();
  const staff = isStaff(user);
  const [settings, categories, products, ratings, wishlist, pendingOrders, unreadMessages] = await Promise.all([
    getSavedSettings(),
    listCategories(),
    listProducts(),
    getRatings(),
    user ? getWishlist(user.id) : [],
    staff ? countPendingOrders() : 0,
    staff ? countUnreadMessages() : 0,
  ]);
  return {
    user,
    settings,
    categories,
    products,
    ratings,
    wishlist,
    admin: staff ? { pendingOrders, unreadMessages } : null,
  };
}
