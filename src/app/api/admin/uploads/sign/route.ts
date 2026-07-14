import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getOwnedRestaurant } from "@/lib/admin-auth";
import { contentTypeForExtension, getSignedUploadUrl } from "@/lib/gcs";

export async function POST(request: Request) {
  const { restaurantId, fileName } = (await request.json()) as {
    restaurantId?: string;
    fileName?: string;
  };
  if (!restaurantId || !fileName) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: owned.status });
  }

  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  // Content-Type is derived server-side from the extension, never trusted from the client.
  const contentType = contentTypeForExtension(extension);
  if (!contentType) {
    return NextResponse.json({ error: "Tipo de archivo no soportado" }, { status: 400 });
  }

  const objectPath = `restaurants/${restaurantId}/uploads/${randomUUID()}${extension}`;
  const uploadUrl = await getSignedUploadUrl(objectPath, contentType);

  return NextResponse.json({ uploadUrl, objectPath, contentType });
}
