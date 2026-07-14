import { NextResponse } from "next/server";

import { createRestaurant, SlugTakenError } from "@/lib/restaurants";
import { getSessionUser } from "@/lib/session";
import { isValidSlug } from "@/lib/slug";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { name, slug } = (await request.json()) as { name?: string; slug?: string };
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      { error: "El slug debe tener minúsculas, números y guiones (2-60 caracteres)" },
      { status: 400 },
    );
  }

  try {
    const restaurant = await createRestaurant({ name: name.trim(), slug, ownerUid: user.uid });
    return NextResponse.json(restaurant, { status: 201 });
  } catch (err) {
    if (err instanceof SlugTakenError) {
      return NextResponse.json({ error: "Ese slug ya está en uso" }, { status: 409 });
    }
    throw err;
  }
}
