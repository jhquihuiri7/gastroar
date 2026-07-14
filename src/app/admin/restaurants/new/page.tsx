import Link from "next/link";

import RestaurantForm from "@/components/admin/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <>
      <header className="admin-shell__header">
        <div className="admin-shell__brand">
          Gastro<span className="acc">AR</span> Admin
        </div>
      </header>
      <main className="admin-shell__main">
        <Link href="/admin" className="admin-back-link">
          ← Tus restaurantes
        </Link>
        <h1 className="admin-page-title admin-page-title--spaced">Crear restaurante</h1>
        <RestaurantForm />
      </main>
    </>
  );
}
