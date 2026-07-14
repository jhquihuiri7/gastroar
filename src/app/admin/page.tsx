import Link from "next/link";

import LogoutButton from "@/components/admin/LogoutButton";
import { listRestaurantsForOwner } from "@/lib/restaurants";
import { getSessionUser } from "@/lib/session";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  const restaurants = user ? await listRestaurantsForOwner(user.uid) : [];

  return (
    <>
      <header className="admin-shell__header">
        <div className="admin-shell__brand">
          Gastro<span className="acc">AR</span> Admin
        </div>
        <LogoutButton />
      </header>
      <main className="admin-shell__main">
        <div className="admin-list-head">
          <h1 className="admin-page-title">Tus restaurantes</h1>
          <Link href="/admin/restaurants/new" className="btn-primary admin-list-head__cta">
            + Crear restaurante
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <div className="admin-card">
            <p className="faint">Todavía no tienes restaurantes. Crea el primero para empezar a cargar tu menú.</p>
          </div>
        ) : (
          <ul className="admin-restaurant-list">
            {restaurants.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/restaurants/${r.id}`} className="admin-card admin-restaurant-list__item">
                  <span className="admin-restaurant-list__name">{r.name}</span>
                  <span className="faint">/r/{r.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
