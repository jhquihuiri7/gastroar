import "server-only";

import { getRestaurantBySlug, type Restaurant } from "./restaurants";
import { getSessionUser } from "./session";

export type OwnedRestaurantResult =
  | { ok: true; restaurant: Restaurant; uid: string }
  | { ok: false; status: 401 | 403 | 404 };

/**
 * Centralizes the ownership check every admin route needs: proxy.ts only
 * confirms *a* session exists, not that this session's uid owns this
 * restaurantId. Used by both API routes (JSON error) and pages (notFound()).
 */
export async function getOwnedRestaurant(restaurantId: string): Promise<OwnedRestaurantResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, status: 401 };

  const restaurant = await getRestaurantBySlug(restaurantId);
  if (!restaurant) return { ok: false, status: 404 };

  if (restaurant.ownerUid !== user.uid) return { ok: false, status: 403 };

  return { ok: true, restaurant, uid: user.uid };
}
