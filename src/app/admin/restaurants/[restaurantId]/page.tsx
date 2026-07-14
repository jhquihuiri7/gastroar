import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryManager from "@/components/admin/CategoryManager";
import DeleteDishButton from "@/components/admin/DeleteDishButton";
import LogoutButton from "@/components/admin/LogoutButton";
import { getOwnedRestaurant } from "@/lib/admin-auth";
import { listDishes } from "@/lib/restaurants";

export default async function RestaurantDashboardPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const owned = await getOwnedRestaurant(restaurantId);
  if (!owned.ok) notFound();

  const { restaurant } = owned;
  const dishes = await listDishes(restaurantId);

  return (
    <>
      <header className="admin-shell__header">
        <div className="admin-shell__brand">
          Gastro<span className="acc">AR</span> Admin
        </div>
        <LogoutButton />
      </header>
      <main className="admin-shell__main">
        <Link href="/admin" className="admin-back-link">
          ← Tus restaurantes
        </Link>
        <h1 className="admin-page-title">{restaurant.name}</h1>
        <p className="faint">
          Carta pública: <code>/r/{restaurant.slug}</code>
        </p>

        <div className="admin-section">
          <h2 className="admin-section-title">Categorías</h2>
          <CategoryManager restaurantId={restaurantId} initialCategories={restaurant.categories} />
        </div>

        <div className="admin-section">
          <div className="admin-list-head">
            <h2 className="admin-section-title">Platos</h2>
            <Link href={`/admin/restaurants/${restaurantId}/dishes/new`} className="btn-primary admin-list-head__cta">
              + Añadir plato
            </Link>
          </div>

          {restaurant.categories.map((cat) => {
            const catDishes = dishes.filter((d) => d.cat === cat.id);
            if (catDishes.length === 0) return null;
            return (
              <div className="admin-dish-group" key={cat.id}>
                <h3 className="admin-dish-group__title">{cat.label}</h3>
                {catDishes.map((dish) => (
                  <div className="admin-dish-row" key={dish.id}>
                    <div>
                      <span className="admin-dish-row__name">{dish.name}</span>
                      <span className="admin-dish-row__price">${dish.price}</span>
                    </div>
                    <div className="admin-dish-row__actions">
                      <Link
                        href={`/admin/restaurants/${restaurantId}/dishes/${dish.id}/edit`}
                        className="btn-small btn-outline"
                      >
                        Editar
                      </Link>
                      <DeleteDishButton restaurantId={restaurantId} dishId={dish.id} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {dishes.length === 0 && <p className="faint">Todavía no hay platos en este menú.</p>}
        </div>
      </main>
    </>
  );
}
