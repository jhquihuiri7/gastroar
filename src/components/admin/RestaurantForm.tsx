"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/slug";

export default function RestaurantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el restaurante");
        setPending(false);
        return;
      }
      router.push(`/admin/restaurants/${data.id}`);
      router.refresh();
    } catch {
      setError("No se pudo crear el restaurante");
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      {error && <div className="admin-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="name">Nombre del restaurante</label>
          <input id="name" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">URL pública (/r/slug)</label>
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Creando…" : "Crear restaurante"}
          </button>
        </div>
      </form>
    </div>
  );
}
