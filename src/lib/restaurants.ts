import "server-only";

import { adminDb } from "./firebase-admin";
import type { Dish } from "./menu-data";
import { DEFAULT_AR_MARKER, type ArMarkerConfig } from "./ar-config";

export const DEFAULT_CATEGORIES = ["starters", "mains", "drinks", "desserts"];

export interface RestaurantCategory {
  id: string;
  label: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerUid: string;
  categories: RestaurantCategory[];
  arMarker: ArMarkerConfig;
  createdAt: number;
}

function restaurantsCol() {
  return adminDb.collection("restaurants");
}

function dishesCol(restaurantId: string) {
  return restaurantsCol().doc(restaurantId).collection("dishes");
}

function defaultCategories(): RestaurantCategory[] {
  return DEFAULT_CATEGORIES.map((id) => ({ id, label: id }));
}

/** Slug doubles as the Firestore document ID (see plan decision C) — one get(), no query. */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const snap = await restaurantsCol().doc(slug).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Restaurant, "id">) };
}

export async function listRestaurantsForOwner(ownerUid: string): Promise<Restaurant[]> {
  const snap = await restaurantsCol().where("ownerUid", "==", ownerUid).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Restaurant, "id">) }));
}

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already taken`);
    this.name = "SlugTakenError";
  }
}

/** Slug uniqueness relies on Firestore's create() rejecting an existing doc ID. */
export async function createRestaurant(params: {
  name: string;
  slug: string;
  ownerUid: string;
}): Promise<Restaurant> {
  const ref = restaurantsCol().doc(params.slug);
  const data = {
    name: params.name,
    slug: params.slug,
    ownerUid: params.ownerUid,
    categories: defaultCategories(),
    arMarker: DEFAULT_AR_MARKER,
    createdAt: Date.now(),
  };

  try {
    await ref.create(data);
  } catch (err) {
    // gRPC code 6 = ALREADY_EXISTS, the expected reason create() can fail here.
    // Anything else (e.g. misconfigured database) should surface as a real error.
    if (err && typeof err === "object" && "code" in err && err.code === 6) {
      throw new SlugTakenError(params.slug);
    }
    throw err;
  }

  return { id: ref.id, ...data };
}

export async function updateRestaurantCategories(
  restaurantId: string,
  categories: RestaurantCategory[],
): Promise<void> {
  await restaurantsCol().doc(restaurantId).update({ categories });
}

export async function updateRestaurantMarker(
  restaurantId: string,
  arMarker: ArMarkerConfig,
): Promise<void> {
  await restaurantsCol().doc(restaurantId).update({ arMarker });
}

export async function listDishes(restaurantId: string): Promise<Dish[]> {
  const snap = await dishesCol(restaurantId).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Dish, "id">) }));
}

export async function getDish(restaurantId: string, dishId: string): Promise<Dish | null> {
  const snap = await dishesCol(restaurantId).doc(dishId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Dish, "id">) };
}

export async function createDish(restaurantId: string, dish: Omit<Dish, "id">): Promise<Dish> {
  const ref = await dishesCol(restaurantId).add(dish);
  return { id: ref.id, ...dish };
}

export async function updateDish(
  restaurantId: string,
  dishId: string,
  patch: Partial<Omit<Dish, "id">>,
): Promise<void> {
  await dishesCol(restaurantId).doc(dishId).update(patch);
}

export async function deleteDish(restaurantId: string, dishId: string): Promise<void> {
  await dishesCol(restaurantId).doc(dishId).delete();
}
