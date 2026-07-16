"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import RealArLauncher, { type LiteEntryReason } from "@/components/experience/RealArLauncher";
import Viewer3D from "@/components/experience/Viewer3D";
import type { CameraFailureReason } from "@/lib/camera";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { ArMarkerConfig } from "@/lib/ar-config";

const ArLiteExperience = dynamic(() => import("@/components/experience/ArLiteExperience"), {
  ssr: false,
  loading: () => <div className="experience experience--real-ar" aria-busy="true" />,
});

interface Props {
  t: Strings;
  dish: Dish;
  marker: ArMarkerConfig;
  tableId?: string;
  onClose: () => void;
  onOpenWaiterSheet: () => void;
}

type TableStage = "real" | "lite" | "viewer";

function requestedInitialStage(): TableStage | null {
  if (typeof window === "undefined") return null;
  const mode = new URLSearchParams(window.location.search).get("ar")?.toLowerCase();
  if (mode === "lite" || mode === "arlite" || mode === "qr") return "lite";
  if (mode === "viewer" || mode === "3d") return "viewer";
  return null;
}

/**
 * Automatic fallback cascade for "View on my table": try full native AR first,
 * then marker-based camera AR, then the plain 3D viewer. Each downgrade
 * happens without user input and surfaces a notice explaining the switch.
 */
export default function ArViewScreen({ t, dish, marker, tableId, onClose, onOpenWaiterSheet }: Props) {
  const initialStage = requestedInitialStage();
  const [stage, setStage] = useState<TableStage>(initialStage ?? "real");
  const [liteNotice, setLiteNotice] = useState<string | undefined>(
    initialStage === "lite" ? t.arLiteActivated : undefined,
  );
  const [cameraFailure, setCameraFailure] = useState<CameraFailureReason | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('.shell [data-screen-root="experience"]')
        ?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [stage]);

  const useLite = useCallback(
    (reason: LiteEntryReason) => {
      setCameraFailure(null);
      setLiteNotice(reason === "unsupported" ? t.arCompatibilityNotice : t.arFailedToLite);
      setStage("lite");
    },
    [t.arCompatibilityNotice, t.arFailedToLite],
  );

  const cameraFailed = useCallback((reason: CameraFailureReason) => {
    setCameraFailure(reason);
    setStage("viewer");
  }, []);

  const retryCamera = useCallback(() => {
    setCameraFailure(null);
    setLiteNotice(t.arLiteActivated);
    setStage("lite");
  }, [t.arLiteActivated]);

  const useViewer = useCallback(() => setStage("viewer"), []);

  if (stage === "real") {
    return (
      <RealArLauncher
        t={t}
        dish={dish}
        onUseLite={useLite}
        onModelError={useViewer}
        onClose={onClose}
      />
    );
  }

  if (stage === "lite") {
    return (
      <ArLiteExperience
        t={t}
        dish={dish}
        marker={marker}
        tableId={tableId}
        notice={liteNotice}
        onCameraFailure={cameraFailed}
        onUse3d={useViewer}
        onClose={onClose}
      />
    );
  }

  return (
    <Viewer3D
      t={t}
      dish={dish}
      cameraFailure={cameraFailure}
      onRetryCamera={
        cameraFailure &&
        (cameraFailure === "permission-denied" || cameraFailure === "busy" || cameraFailure === "unknown")
          ? retryCamera
          : undefined
      }
      onClose={onClose}
      onOpenWaiterSheet={onOpenWaiterSheet}
    />
  );
}
