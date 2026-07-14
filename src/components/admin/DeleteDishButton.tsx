"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDishButton({ restaurantId, dishId }: { restaurantId: string; dishId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este plato?")) return;
    setPending(true);
    await fetch(`/api/admin/restaurants/${restaurantId}/dishes/${dishId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button type="button" className="btn-small btn-danger-outline" onClick={handleDelete} disabled={pending}>
      Eliminar
    </button>
  );
}
