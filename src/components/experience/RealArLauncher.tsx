"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useModelViewerLifecycle } from "@/hooks/useModelViewer";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { ArStatus, ModelViewerArStatusEvent, ModelViewerElement } from "@/types/model-viewer";
import { IconClose, IconCube } from "@/components/icons";
import ArLoadingScreen from "@/components/screens/ArLoadingScreen";

export type LiteEntryReason = "unsupported" | "failed";

interface Props {
  t: Strings;
  dish: Dish;
  onUseLite: (reason: LiteEntryReason) => void;
  onModelError: () => void;
  onClose: () => void;
}

type CapabilityState = "checking" | "ready";

export default function RealArLauncher({ t, dish, onUseLite, onModelError, onClose }: Props) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [capability, setCapability] = useState<CapabilityState>("checking");
  const [arStatus, setArStatus] = useState<ArStatus>("not-presenting");
  const [launching, setLaunching] = useState(false);
  const { defined, state, progress } = useModelViewerLifecycle(viewerRef, dish.modelGlbUrl);

  // The lite stage renders the same .glb, so a download/parse failure here would
  // fail there too — skip straight to the 3D viewer, which has its own retry UI.
  useEffect(() => {
    if (state === "error") onModelError();
  }, [onModelError, state]);

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
  }, [defined, onUseLite]);

  const launchAr = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.canActivateAR) {
      onUseLite("unsupported");
      return;
    }

    try {
      // Create the promise before an async boundary so the native launcher
      // receives the original click's user activation.
      const activation = viewer.activateAR();
      setLaunching(true);
      await activation;
    } catch {
      onUseLite("failed");
    } finally {
      setLaunching(false);
    }
  }, [onUseLite]);

  return (
    <div
      className="experience experience--real-ar anim-fade-in"
      data-screen-root="experience"
      tabIndex={-1}
      aria-label={`${t.realAr}: ${dish.name}`}
    >
      {defined && dish.modelGlbUrl && (
        <model-viewer
          ref={viewerRef}
          className="experience__mv"
          src={dish.modelGlbUrl}
          ios-src={dish.modelUsdzUrl}
          alt={dish.name}
          poster={dish.imageUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          ar-scale="fixed"
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

      {state === "ready" && (
        <div className="experience__bottom">
          {arStatus === "session-started" && <div className="hint-pill">{t.detecting}</div>}
          {arStatus === "object-placed" && <div className="hint-pill">{t.anchoring}</div>}
          <div className="glass-card glass-card--experience">
            <div className="glass-card__eyebrow">
              {capability === "checking"
                ? t.arCheckingSupport
                : launching
                  ? t.launchingRealAr
                  : t.realAr}
            </div>
            <div className="glass-card__row">
              <div className="glass-card__name">{dish.name}</div>
              <div className="glass-card__price">${dish.price}</div>
            </div>
            <div className="glass-card__ing">{t.realArInstructions}</div>
            <div className="glass-card__note">{t.quickLookFallback}</div>
            <div className="glass-card__actions">
              <button
                type="button"
                className="btn-primary"
                disabled={capability !== "ready" || launching}
                onClick={() => void launchAr()}
              >
                <IconCube size={16} />
                {launching ? t.launchingRealAr : t.tapToPlace}
              </button>
            </div>
          </div>
        </div>
      )}

      {(state === "registering" || state === "loading") && (
        <ArLoadingScreen t={t} dish={dish} progress={progress} tip={t.steadyTip} />
      )}
    </div>
  );
}
