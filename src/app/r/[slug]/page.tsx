import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TenantGastroApp from "@/components/TenantGastroApp";
import { getRestaurantBySlug, listDishes } from "@/lib/restaurants";

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function TenantMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const dishes = await listDishes(restaurant.id);

  return <TenantGastroApp dishes={dishes} categories={restaurant.categories} />;
}
