import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import { IconCubeWire } from "@/components/icons";

interface Props {
  t: Strings;
  dish: Dish;
  /** Progreso real de descarga del .glb (0–1), del evento "progress" de model-viewer. */
  progress: number;
  tip?: string;
}

export default function ArLoadingScreen({ t, dish, progress, tip }: Props) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <div className="arload anim-fade-in">
      <div className="arload__scrim" />
      <div className="arload__center">
        <div className="arload__rings">
          <div className="arload__ring" />
          <div className="arload__ring arload__ring--d2" />
          <div className="arload__ring arload__ring--d3" />
          <IconCubeWire size={44} strokeWidth={1.4} className="acc" />
        </div>
        <div className="arload__dish">{dish.name}</div>
        {/* Descargando el modelo. La mesa todavía no entra en juego: eso solo pasa
            cuando la sesión AR nativa arranca de verdad. */}
        <div className="arload__msg">
          {t.preparing} {pct}%
        </div>
        <div
          className="arload__bar"
          role="progressbar"
          aria-label={t.preparing}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="arload__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {tip && <div className="arload__tip">{tip}</div>}
    </div>
  );
}
