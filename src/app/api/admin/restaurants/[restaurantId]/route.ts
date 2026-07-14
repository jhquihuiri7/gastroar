import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import { updateRestaurantCategories, type RestaurantCategory } from "@/lib/restaurants";

export async function PATCH(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  const { categories } = (await request.json()) as { categories?: RestaurantCategory[] };
  if (!Array.isArray(categories) || categories.some((c) => !c.id || !c.label)) {
    return NextResponse.json({ error: "Lista de categorías inválida" }, { status: 400 });
  }

  await updateRestaurantCategories(restaurantId, categories);
  return NextResponse.json({ ok: true });
}
