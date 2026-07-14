import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import { parseDishInput } from "@/lib/dish-input";
import { deleteDish, updateDish } from "@/lib/restaurants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string; dishId: string }> },
) {
  const { restaurantId, dishId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  const dishInput = parseDishInput(await request.json());
  if (!dishInput) {
    return NextResponse.json({ error: "Datos de plato inválidos" }, { status: 400 });
  }

  await updateDish(restaurantId, dishId, dishInput);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string; dishId: string }> },
) {
  const { restaurantId, dishId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  await deleteDish(restaurantId, dishId);
  return NextResponse.json({ ok: true });
}
