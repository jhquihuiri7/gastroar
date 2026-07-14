import type { Dish } from "./menu-data";

export type DishInput = Omit<Dish, "id">;

/** Shared by DishForm (client) and the dishes API routes (server) so both agree on what a valid dish looks like. */
export function parseDishInput(body: unknown): DishInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  if (typeof b.cat !== "string" || !b.cat) return null;
  if (typeof b.name !== "string" || !b.name.trim()) return null;
  if (typeof b.price !== "number" || Number.isNaN(b.price) || b.price < 0) return null;
  if (typeof b.desc !== "string") return null;
  if (!Array.isArray(b.tags) || !b.tags.every((t) => typeof t === "string")) return null;
  if (!Array.isArray(b.ing) || !b.ing.every((i) => typeof i === "string")) return null;

  const dish: DishInput = {
    cat: b.cat,
    name: b.name.trim(),
    price: b.price,
    tags: b.tags as string[],
    desc: b.desc,
    ing: b.ing as string[],
  };
  if (typeof b.imageUrl === "string" && b.imageUrl) dish.imageUrl = b.imageUrl;
  if (typeof b.modelGlbUrl === "string" && b.modelGlbUrl) dish.modelGlbUrl = b.modelGlbUrl;
  if (typeof b.modelUsdzUrl === "string" && b.modelUsdzUrl) dish.modelUsdzUrl = b.modelUsdzUrl;

  return dish;
}
