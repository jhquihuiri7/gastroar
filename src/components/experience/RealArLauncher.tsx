"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useModelViewerLifecycle } from "@/hooks/useModelViewer";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { ArStatus, ModelViewerArStatusEvent, ModelViewerElement } from "@/types/model-viewer";
import { IconClose, IconCube } from "@/components/icons";
import ArLoadingScreen from "@/components/screens/ArLoadingScreen";

export type LiteEntryReason = "manual" | "unsupported" | "failed";

interface Props {
  t: Strings;
  dish: Dish;
  onUseLite: (reason: LiteEntryReason) => void;
  onClose: () => void;
}

type CapabilityState = "checking" | "ready";

export default function RealArLauncher({ t, dish, onUseLite, onClose }: Props) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [instanceKey, setInstanceKey] = useState(0);
  const [capability, setCapability] = useState<CapabilityState>("checking");
  const [arStatus, setArStatus] = useState<ArStatus>("not-presenting");
  const [launching, setLaunching] = useState(false);
  const { defined, state, progress } = useModelViewerLifecycle(
    viewerRef,
    dish.modelGlbUrl,
    instanceKey,
  );

  useEffect(() => {
    if (!defined || state !== "ready") return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const probe = () => {
      if (cancelled) return;
      const viewer = viewerRef.current;
      if (viewer?.canActivateAR) {
        setCapability("ready");
        return;
      }

      attempts += 1;
      if (attempts >= 50) {
        onUseLite("unsupported");
        return;
      }
      timer = setTimeout(probe, 100);
    };

    probe();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [defined, onUseLite, state]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!defined || !viewer) return;

    const onArStatus = (event: Event) => {
      const status = (event as ModelViewerArStatusEvent).detail.status;
      setArStatus(status);
      if (status === "failed") onUseLite("failed");
    };

    viewer.addEventListener("ar-status", onArStatus);
    return () => viewer.removeEventListener("ar-status", onArStatus);
  }, [defined, instanceKey, onUseLite]);

  const launchAr = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.canActivateAR) {
      onUseLite("unsupported");
      return;
    }

    setLaunching(true);
    try {
      await viewer.activateAR();
    } catch {
      onUseLite("failed");
    } finally {
      setLaunching(false);
    }
  }, [onUseLite]);

  const retryModel = () => {
    setCapability("checking");
    setInstanceKey((current) => current + 1);
  };

  return (
    <div
      className="experience experience--real-ar anim-fade-in"
      data-screen-root="experience"
      tabIndex={-1}
      aria-label={`${t.realAr}: ${dish.name}`}
    >
      {defined && dish.modelGlbUrl && (
        <model-viewer
          key={instanceKey}
          ref={viewerRef}
          className="experience__mv"
          src={dish.modelGlbUrl}
          ios-src={dish.modelUsdzUrl}
          alt={dish.name}
          poster={dish.imageUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          ar-scale="auto"
          ar-usdz-max-texture-size="1024"
          camera-controls
          touch-action="none"
          shadow-intensity="1"
          shadow-softness="0.8"
          exposure="1"
          environment-image="neutral"
          interaction-prompt="none"
          loading="eager"
        />
      )}

      <div className="experience__vignette" />
      <div className="experience__topbar">
        <button type="button" className="hud-btn hud-btn--lg" aria-label={t.close} onClick={onClose}>
          <IconClose size={17} />
        </button>
        <div className="experience__badge">
          <span className="live-dot" />
          <IconCube size={14} strokeWidth={1.9} />
          {t.realAr}
        </div>
      </div>

      {state === "error" && (
        <div className="experience__error" role="alert">
          <div>{t.modelError}</div>
          <button type="button" className="glass-btn" onClick={retryModel}>
            {t.retry}
          </button>
          <button type="button" className="glass-btn" onClick={() => onUseLite("failed")}>
            {t.useArLite}
          </button>
        </div>
      )}

      {state === "ready" && (
        <div className="experience__bottom">
          {arStatus === "session-started" && <div className="hint-pill">{t.detecting}</div>}
          {arStatus === "object-placed" && <div className="hint-pill">{t.anchoring}</div>}
          <div className="glass-card glass-card--experience">
            <div className="glass-card__eyebrow">{t.realArReady}</div>
            <div className="glass-card__row">
              <div className="glass-card__name">{dish.name}</div>
              <div className="glass-card__price">${dish.price}</div>
            </div>
            <div className="glass-card__ing">{t.realArInstructions}</div>
            <div className="glass-card__actions glass-card__actions--stack">
              <button
                type="button"
                className="glass-btn glass-btn--primary"
                disabled={launching || capability === "checking"}
                onClick={launchAr}
              >
                <IconCube size={15} />
                {launching ? t.launchingRealAr : capability === "checking" ? t.preparing : t.launchRealAr}
              </button>
              <button type="button" className="glass-btn" onClick={() => onUseLite("manual")}>
                {t.useArLite}
              </button>
            </div>
            <div className="glass-card__note">{t.quickLookFallback}</div>
          </div>
        </div>
      )}

      {(state === "registering" || state === "loading") && (
        <ArLoadingScreen t={t} dish={dish} progress={progress} tip={t.steadyTip} />
      )}
    </div>
  );
}
