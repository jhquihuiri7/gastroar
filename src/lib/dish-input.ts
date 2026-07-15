import type { Dish } from "./menu-data";
import type { DishArCalibration, Vector3Tuple } from "./ar-config";

export type DishInput = Omit<Dish, "id">;

function numericTuple(value: unknown, min: number, max: number): Vector3Tuple | undefined {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    !value.every((item) => typeof item === "number" && Number.isFinite(item) && item >= min && item <= max)
  ) {
    return undefined;
  }
  return value as Vector3Tuple;
}

function parseArCalibration(value: unknown): DishArCalibration | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  const realSizeMm = numericTuple(input.realSizeMm, 1, 2_000);
  const anchorOffsetMm = numericTuple(input.anchorOffsetMm, -2_000, 2_000);
  const rotationDeg = numericTuple(input.rotationDeg, -360, 360);
  const scaleCorrection = input.scaleCorrection;

  if (!realSizeMm || !anchorOffsetMm || !rotationDeg) return undefined;
  if (
    typeof scaleCorrection !== "number" ||
    !Number.isFinite(scaleCorrection) ||
    scaleCorrection < 0.1 ||
    scaleCorrection > 10
  ) {
    return undefined;
  }

  return { realSizeMm, anchorOffsetMm, rotationDeg, scaleCorrection };
}

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
  if (b.arCalibration !== undefined) {
    const arCalibration = parseArCalibration(b.arCalibration);
    if (!arCalibration) return null;
    dish.arCalibration = arCalibration;
  }

  return dish;
}
