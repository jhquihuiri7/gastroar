"use client";

import { useCallback, useEffect, useState } from "react";
import ArLiteExperience from "@/components/experience/ArLiteExperience";
import RealArLauncher, { type LiteEntryReason } from "@/components/experience/RealArLauncher";
import Viewer3D from "@/components/experience/Viewer3D";
import type { CameraFailureReason } from "@/lib/camera";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";

export type ExperienceIntent = "viewer3d" | "table";

interface Props {
  t: Strings;
  dish: Dish;
  intent: ExperienceIntent;
  onClose: () => void;
  onOpenWaiterSheet: () => void;
}

type TableStage = "real" | "lite" | "viewer";

export default function ArViewScreen({
  t,
  dish,
  intent,
  onClose,
  onOpenWaiterSheet,
}: Props) {
  const [stage, setStage] = useState<TableStage>(intent === "table" ? "real" : "viewer");
  const [liteNotice, setLiteNotice] = useState<string | undefined>();
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
      setLiteNotice(
        reason === "unsupported"
          ? t.arCompatibilityNotice
          : reason === "failed"
            ? t.arFailedToLite
            : t.arLiteActivated,
      );
      setStage("lite");
    },
    [t.arCompatibilityNotice, t.arFailedToLite, t.arLiteActivated],
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
    return <RealArLauncher t={t} dish={dish} onUseLite={useLite} onClose={onClose} />;
  }

  if (stage === "lite") {
    return (
      <ArLiteExperience
        t={t}
        dish={dish}
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
        intent === "table" &&
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
