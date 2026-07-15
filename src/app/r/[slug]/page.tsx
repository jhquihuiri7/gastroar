import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TenantGastroApp from "@/components/TenantGastroApp";
import { getRestaurantBySlug, listDishes } from "@/lib/restaurants";
import { normalizeMarkerConfig, normalizeTableId } from "@/lib/ar-config";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return {};

  return {
    title: `${restaurant.name} — GastroAR`,
    description: `Carta digital de ${restaurant.name}.`,
  };
}

export default async function TenantMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const dishes = await listDishes(restaurant.id);
  const query = searchParams ? await searchParams : {};
  const tableId = normalizeTableId(typeof query.table === "string" ? query.table : undefined);

  return (
    <TenantGastroApp
      dishes={dishes}
      categories={restaurant.categories}
      marker={normalizeMarkerConfig(restaurant.arMarker)}
      tableId={tableId}
    />
  );
}
