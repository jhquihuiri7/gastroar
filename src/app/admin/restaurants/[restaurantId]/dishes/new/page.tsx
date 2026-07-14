import Link from "next/link";
import { notFound } from "next/navigation";

import DishForm from "@/components/admin/DishForm";
import { getOwnedRestaurant } from "@/lib/admin-auth";

export default async function NewDishPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) notFound();

  return (
    <>
      <header className="admin-shell__header">
        <div className="admin-shell__brand">
          Gastro<span className="acc">AR</span> Admin
        </div>
      </header>
      <main className="admin-shell__main">
        <Link href={`/admin/restaurants/${restaurantId}`} className="admin-back-link">
          ← {owned.restaurant.name}
        </Link>
        <h1 className="admin-page-title admin-page-title--spaced">Añadir plato</h1>
        <DishForm restaurantId={restaurantId} categories={owned.restaurant.categories} />
      </main>
    </>
  );
}
