import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import type { ArMarkerConfig } from "@/lib/ar-config";
import {
  updateRestaurantCategories,
  updateRestaurantMarker,
  type RestaurantCategory,
} from "@/lib/restaurants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const { restaurantId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  const body = (await request.json()) as {
    categories?: RestaurantCategory[];
    arMarker?: ArMarkerConfig;
  };

  if (body.arMarker !== undefined) {
    const marker = body.arMarker;
    if (
      !marker ||
      typeof marker.targetUrl !== "string" ||
      !marker.targetUrl ||
      typeof marker.previewUrl !== "string" ||
      !marker.previewUrl ||
      typeof marker.physicalWidthMm !== "number" ||
      !Number.isFinite(marker.physicalWidthMm) ||
      marker.physicalWidthMm < 40 ||
      marker.physicalWidthMm > 300 ||
      typeof marker.version !== "string" ||
      !/^[a-zA-Z0-9._-]{1,80}$/.test(marker.version)
    ) {
      return NextResponse.json({ error: "Configuración de marcador inválida" }, { status: 400 });
    }

    await updateRestaurantMarker(restaurantId, marker);
    return NextResponse.json({ ok: true });
  }

  const categories = body.categories;
  if (!Array.isArray(categories) || categories.some((category) => !category.id || !category.label)) {
    return NextResponse.json({ error: "Lista de categorías inválida" }, { status: 400 });
  }

  await updateRestaurantCategories(restaurantId, categories);
  return NextResponse.json({ ok: true });
}
