import { notFound } from "next/navigation";

import PrintableTableMarker from "@/components/admin/PrintableTableMarker";
import { normalizeMarkerConfig } from "@/lib/ar-config";
import { getRestaurantBySlug } from "@/lib/restaurants";

export default async function TableMarkerPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <PrintableTableMarker restaurantName={restaurant.name} restaurantSlug={restaurant.slug} marker={normalizeMarkerConfig(restaurant.arMarker)} initialTable={typeof query.table === "string" ? query.table : "12"} />;
}
