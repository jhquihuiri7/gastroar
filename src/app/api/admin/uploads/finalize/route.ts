import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import { finalizeUploadedObject, publicObjectUrl } from "@/lib/gcs";

export async function POST(request: Request) {
  const { restaurantId, objectPath } = (await request.json()) as {
    restaurantId?: string;
    objectPath?: string;
  };
  if (!restaurantId || !objectPath) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  // Must match exactly what /api/admin/uploads/sign hands out — refuses to
  // finalize an arbitrary path someone could otherwise pass in.
  if (!objectPath.startsWith(`restaurants/${restaurantId}/uploads/`)) {
    return NextResponse.json({ error: "Ruta de archivo inválida" }, { status: 400 });
  }

  await finalizeUploadedObject(objectPath);
  return NextResponse.json({ url: publicObjectUrl(objectPath) });
}
