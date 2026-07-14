import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import { parseDishInput } from "@/lib/dish-input";
import { createDish } from "@/lib/restaurants";

export async function POST(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  const dishInput = parseDishInput(await request.json());
  if (!dishInput) {
    return NextResponse.json({ error: "Datos de plato inválidos" }, { status: 400 });
  }

  const dish = await createDish(restaurantId, dishInput);
  return NextResponse.json(dish, { status: 201 });
}
