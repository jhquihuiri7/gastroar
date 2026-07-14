"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { RestaurantCategory } from "@/lib/restaurants";
import { slugify } from "@/lib/slug";

interface Props {
  restaurantId: string;
  initialCategories: RestaurantCategory[];
}

export default function CategoryManager({ restaurantId, initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newLabel, setNewLabel] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addCategory() {
    const label = newLabel.trim();
    if (!label) return;
    const id = slugify(label) || `cat-${categories.length + 1}`;
    if (categories.some((c) => c.id === id)) {
      setError("Ya existe una categoría con ese nombre");
      return;
    }
    setError(null);
    setCategories([...categories, { id, label }]);
    setNewLabel("");
  }

  function removeCategory(id: string) {
    setCategories(categories.filter((c) => c.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      {error && <div className="admin-error">{error}</div>}

      {categories.map((cat, i) => (
        <div className="admin-category-row" key={cat.id}>
          <input
            value={cat.label}
            onChange={(e) => {
              const next = [...categories];
              next[i] = { ...next[i], label: e.target.value };
              setCategories(next);
            }}
          />
          <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Subir" disabled={i === 0}>
            ↑
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => move(i, 1)}
            aria-label="Bajar"
            disabled={i === categories.length - 1}
          >
            ↓
          </button>
          <button type="button" className="btn-small btn-danger-outline" onClick={() => removeCategory(cat.id)}>
            Quitar
          </button>
        </div>
      ))}

      <div className="admin-category-add">
        <input
          placeholder="Nueva categoría"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCategory();
            }
          }}
        />
        <button type="button" className="btn-small btn-outline" onClick={addCategory}>
          Añadir
        </button>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="btn-primary" onClick={save} disabled={pending}>
          {pending ? "Guardando…" : "Guardar categorías"}
        </button>
      </div>
    </div>
  );
}
