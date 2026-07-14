"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useModelViewerLifecycle } from "@/hooks/useModelViewer";
import type { CameraFailureReason } from "@/lib/camera";
import { hasNativeSettingsBridge, openNativeSettings } from "@/lib/camera";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { ModelViewerElement } from "@/types/model-viewer";
import { IconBell, IconClose, IconCube, IconReset } from "@/components/icons";
import ArLoadingScreen from "@/components/screens/ArLoadingScreen";

interface Props {
  t: Strings;
  dish: Dish;
  cameraFailure?: CameraFailureReason | null;
  onRetryCamera?: () => void;
  onClose: () => void;
  onOpenWaiterSheet: () => void;
}

function cameraFailureMessage(reason: CameraFailureReason, t: Strings): string {
  const messages: Record<CameraFailureReason, string> = {
    "permission-denied": t.cameraDenied,
    unavailable: t.cameraUnavailable,
    busy: t.cameraBusy,
    insecure: t.cameraInsecure,
    unknown: t.cameraFailed,
  };

  return `${messages[reason]} ${t.cameraFallback3d}`;
}

export default function Viewer3D({
  t,
  dish,
  cameraFailure,
  onRetryCamera,
  onClose,
  onOpenWaiterSheet,
}: Props) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const cameraHelpTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cameraHelpCloseRef = useRef<HTMLButtonElement | null>(null);
  const [instanceKey, setInstanceKey] = useState(0);
  const [showCameraHelp, setShowCameraHelp] = useState(false);
  const { defined, state, progress } = useModelViewerLifecycle(
    viewerRef,
    dish.modelGlbUrl,
    instanceKey,
  );

  useEffect(() => {
    if (!showCameraHelp) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallbackFocus = cameraHelpTriggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowCameraHelp(false);
      }
      if (event.key === "Tab") {
        event.preventDefault();
        cameraHelpCloseRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    cameraHelpCloseRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
        else fallbackFocus?.focus();
      });
    };
  }, [showCameraHelp]);

  const reset = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.resetTurntableRotation(0);
    viewer.cameraOrbit = "0deg 75deg auto";
    viewer.jumpCameraToGoal();
  }, []);

  const retryModel = () => setInstanceKey((current) => current + 1);

  if (!dish.modelGlbUrl) {
    return (
      <div
        className="experience experience--viewer anim-fade-in"
        data-screen-root="experience"
        tabIndex={-1}
        aria-label={`${t.viewer3d}: ${dish.name}`}
      >
        <div className="experience__empty">
          <IconCube size={42} strokeWidth={1.3} className="acc" />
          <div className="experience__empty-title">{dish.name}</div>
          <div className="experience__empty-copy">{t.modelSoon}</div>
          <button type="button" className="glass-btn" onClick={onClose}>
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="experience experience--viewer anim-fade-in"
      data-screen-root="experience"
      tabIndex={-1}
      aria-label={`${t.viewer3d}: ${dish.name}`}
    >
      {defined && (
        <model-viewer
          key={instanceKey}
          ref={viewerRef}
          className="experience__mv"
          src={dish.modelGlbUrl}
          alt={dish.name}
          poster={dish.imageUrl}
          camera-controls
          touch-action="none"
          shadow-intensity="1"
          shadow-softness="0.8"
          exposure="1"
          environment-image="neutral"
          camera-orbit="0deg 75deg auto"
          interaction-prompt="auto"
          loading="eager"
        />
      )}

      <div className="experience__vignette" />

      <div className="experience__topbar">
        <button type="button" className="hud-btn hud-btn--lg" aria-label={t.close} onClick={onClose}>
          <IconClose size={17} />
        </button>
        <div className="experience__badge">
          <IconCube size={14} strokeWidth={1.9} />
          {t.viewer3d}
        </div>
      </div>

      {cameraFailure && (
        <div className="experience__fallback-note" role="status">
          <span>{cameraFailureMessage(cameraFailure, t)}</span>
          <div className="experience__fallback-actions">
            {onRetryCamera && (
              <button type="button" onClick={onRetryCamera}>
                {t.retryCamera}
              </button>
            )}
            {cameraFailure === "permission-denied" && (
              <button
                type="button"
                ref={cameraHelpTriggerRef}
                onClick={() => {
                  if (!hasNativeSettingsBridge() || !openNativeSettings()) setShowCameraHelp(true);
                }}
              >
                {hasNativeSettingsBridge() ? t.openSettings : t.cameraHelp}
              </button>
            )}
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="experience__error" role="alert">
          <div>{t.modelError}</div>
          <button type="button" className="glass-btn" onClick={retryModel}>
            {t.retry}
          </button>
        </div>
      )}

      {state === "ready" && (
        <div className="experience__bottom">
          <div className="hint-pill">{t.viewerHint}</div>
          <div className="glass-card">
            <div className="glass-card__row">
              <div className="glass-card__name">{dish.name}</div>
              <div className="glass-card__price">${dish.price}</div>
            </div>
            <div className="glass-card__ing">{dish.ing.join(", ")}</div>
            <div className="glass-card__actions">
              <button type="button" className="glass-btn" onClick={reset}>
                <IconReset size={14} className="acc" />
                {t.reset}
              </button>
              <button
                type="button"
                className="glass-btn glass-btn--round acc"
                aria-label={t.optWaiter}
                onClick={onOpenWaiterSheet}
              >
                <IconBell size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCameraHelp && (
        <div className="experience__dialog" role="dialog" aria-modal="true" aria-label={t.cameraHelp}>
          <div className="experience__dialog-card">
            <div className="experience__dialog-title">{t.cameraNeeded}</div>
            <p>{t.cameraHelpSteps}</p>
            <button
              type="button"
              ref={cameraHelpCloseRef}
              className="glass-btn"
              onClick={() => setShowCameraHelp(false)}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {(state === "registering" || state === "loading") && (
        <ArLoadingScreen t={t} dish={dish} progress={progress} tip={t.viewerHint} />
      )}
    </div>
  );
}
