"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import type { ArMarkerConfig } from "@/lib/ar-config";

interface Props {
  restaurantName: string;
  restaurantSlug: string;
  marker: ArMarkerConfig;
  initialTable: string;
}

function safeTable(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60) || "12";
}

export default function PrintableTableMarker({ restaurantName, restaurantSlug, marker, initialTable }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [table, setTable] = useState(safeTable(initialTable));
  useEffect(() => {
    if (!canvasRef.current) return;
    const menuUrl = new URL(`/r/${restaurantSlug}`, window.location.origin);
    menuUrl.searchParams.set("table", safeTable(table));
    menuUrl.searchParams.set("marker", marker.version);
    void QRCode.toCanvas(canvasRef.current, menuUrl.toString(), {
      width: 512,
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#111111ff", light: "#ffffffff" },
    });
  }, [marker.version, restaurantSlug, table]);

  return (
    <main className="marker-print-page">
      <div className="marker-print-toolbar">
        <label htmlFor="table-id">Mesa</label>
        <input id="table-id" value={table} onChange={(event) => setTable(safeTable(event.target.value))} />
        <button type="button" onClick={() => window.print()}>Imprimir</button>
      </div>
      <section className="marker-print-sheet" aria-label={`Marcador para la mesa ${table}`}>
        <header><strong>{restaurantName}</strong><span>MESA {table.toUpperCase()}</span></header>
        <div className="marker-print-grid">
          <div className="marker-print-target">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={marker.previewUrl} alt="Referencia visual para realidad aumentada" style={{ width: `${marker.physicalWidthMm}mm` }} />
            <small>REFERENCIA AR · NO CUBRIR</small>
          </div>
          <div className="marker-print-qr">
            <canvas ref={canvasRef} />
            <strong>ESCANEA PARA VER EL MENÚ</strong>
          </div>
        </div>
        <footer>Coloca esta tarjeta plana sobre la mesa. Imprime al 100%, sin “ajustar a página”.</footer>
      </section>
    </main>
  );
}
