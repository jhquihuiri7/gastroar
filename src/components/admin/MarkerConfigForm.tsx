"use client";

import { useState } from "react";
import Link from "next/link";

import AssetUploader from "@/components/admin/AssetUploader";
import {
  DEFAULT_AR_MARKER,
  normalizeMarkerConfig,
  type ArMarkerConfig,
} from "@/lib/ar-config";

interface Props {
  restaurantId: string;
  restaurantSlug: string;
  initialConfig?: Partial<ArMarkerConfig>;
}

export default function MarkerConfigForm({ restaurantId, restaurantSlug, initialConfig }: Props) {
  const initial = normalizeMarkerConfig(initialConfig);
  const [targetUrl, setTargetUrl] = useState(initial.targetUrl);
  const [previewUrl, setPreviewUrl] = useState(initial.previewUrl);
  const [physicalWidthMm, setPhysicalWidthMm] = useState(String(initial.physicalWidthMm));
  const [version, setVersion] = useState(initial.version);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const arMarker: ArMarkerConfig = {
      targetUrl,
      previewUrl,
      physicalWidthMm: Number(physicalWidthMm),
      version,
    };

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arMarker }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No se pudo guardar el marcador");
      setMessage("Marcador guardado");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el marcador");
    } finally {
      setPending(false);
    }
  }

  function restoreDemo() {
    setTargetUrl(DEFAULT_AR_MARKER.targetUrl);
    setPreviewUrl(DEFAULT_AR_MARKER.previewUrl);
    setPhysicalWidthMm(String(DEFAULT_AR_MARKER.physicalWidthMm));
    setVersion(DEFAULT_AR_MARKER.version);
    setMessage("Configuración de demostración cargada; guarda para aplicarla");
  }

  return (
    <div className="admin-card">
      <form onSubmit={save}>
        <p className="faint admin-marker-copy">
          El QR abre la carta y la imagen de referencia fija la posición del plato. Imprime siempre la
          referencia al ancho físico configurado.
        </p>
        <div className="admin-marker-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Vista previa del marcador de seguimiento" />
        </div>
        <div className="admin-form-row">
          <AssetUploader restaurantId={restaurantId} label="Imagen de referencia" accept="image/png,image/jpeg,image/webp" value={previewUrl} onChange={setPreviewUrl} />
          <AssetUploader restaurantId={restaurantId} label="Target compilado (.mind)" accept=".mind" value={targetUrl} onChange={setTargetUrl} />
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="marker-width">Ancho físico de la referencia (mm)</label>
            <input id="marker-width" type="number" min="40" max="300" required value={physicalWidthMm} onChange={(event) => setPhysicalWidthMm(event.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="marker-version">Versión</label>
            <input id="marker-version" pattern="[a-zA-Z0-9._-]{1,80}" required value={version} onChange={(event) => setVersion(event.target.value)} />
          </div>
        </div>
        {message && <div className="admin-inline-message" role="status">{message}</div>}
        <div className="admin-form-actions admin-form-actions--wrap">
          <button type="submit" className="btn-primary" disabled={pending || !targetUrl || !previewUrl}>{pending ? "Guardando…" : "Guardar marcador"}</button>
          <button type="button" className="btn-secondary" onClick={restoreDemo}>Usar demo</button>
          <Link href={`/r/${restaurantSlug}/marker?table=12`} target="_blank" className="btn-small btn-outline admin-marker-print-link">Preparar tarjeta para imprimir</Link>
        </div>
      </form>
    </div>
  );
}
