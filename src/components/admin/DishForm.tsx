"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AssetUploader from "@/components/admin/AssetUploader";
import type { Dish } from "@/lib/menu-data";
import type { RestaurantCategory } from "@/lib/restaurants";

interface Props {
  restaurantId: string;
  categories: RestaurantCategory[];
  dish?: Dish;
}

export default function DishForm({ restaurantId, categories, dish }: Props) {
  const router = useRouter();
  const isEdit = Boolean(dish);

  const [cat, setCat] = useState(dish?.cat ?? categories[0]?.id ?? "");
  const [name, setName] = useState(dish?.name ?? "");
  const [price, setPrice] = useState(dish ? String(dish.price) : "");
  const [tags, setTags] = useState(dish?.tags.join(", ") ?? "");
  const [desc, setDesc] = useState(dish?.desc ?? "");
  const [ing, setIng] = useState(dish?.ing.join(", ") ?? "");
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl ?? "");
  const [modelGlbUrl, setModelGlbUrl] = useState(dish?.modelGlbUrl ?? "");
  const [modelUsdzUrl, setModelUsdzUrl] = useState(dish?.modelUsdzUrl ?? "");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function splitList(value: string): string[] {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const payload = {
      cat,
      name,
      price: Number(price),
      tags: splitList(tags),
      desc,
      ing: splitList(ing),
      imageUrl: imageUrl || undefined,
      modelGlbUrl: modelGlbUrl || undefined,
      modelUsdzUrl: modelUsdzUrl || undefined,
    };

    try {
      const url = isEdit
        ? `/api/admin/restaurants/${restaurantId}/dishes/${dish!.id}`
        : `/api/admin/restaurants/${restaurantId}/dishes`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "No se pudo guardar el plato");
        setPending(false);
        return;
      }
      router.push(`/admin/restaurants/${restaurantId}`);
      router.refresh();
    } catch {
      setError("No se pudo guardar el plato");
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      {error && <div className="admin-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="cat">Categoría</label>
            <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="price">Precio</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="name">Nombre del plato</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="admin-field">
          <label htmlFor="desc">Descripción</label>
          <textarea
            id="desc"
            className="admin-field-textarea"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="ing">Ingredientes (separados por coma)</label>
          <input id="ing" value={ing} onChange={(e) => setIng(e.target.value)} />
        </div>

        <div className="admin-field">
          <label htmlFor="tags">Tags (separados por coma)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <AssetUploader
          restaurantId={restaurantId}
          label="Foto del plato"
          accept="image/png,image/jpeg,image/webp"
          value={imageUrl}
          onChange={setImageUrl}
        />

        <div className="admin-form-row">
          <AssetUploader
            restaurantId={restaurantId}
            label="Modelo 3D (.glb)"
            accept=".glb"
            value={modelGlbUrl}
            onChange={setModelGlbUrl}
          />
          <AssetUploader
            restaurantId={restaurantId}
            label="Modelo USDZ (opcional, iOS)"
            accept=".usdz"
            value={modelUsdzUrl}
            onChange={setModelUsdzUrl}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear plato"}
          </button>
        </div>
      </form>
    </div>
  );
}
