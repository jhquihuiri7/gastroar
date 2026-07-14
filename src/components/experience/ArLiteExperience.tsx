"use client";

import { useEffect, useRef, useState } from "react";
import { useModelViewerLifecycle } from "@/hooks/useModelViewer";
import {
  requestEnvironmentCamera,
  stopCameraStream,
  type CameraFailureReason,
} from "@/lib/camera";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { ModelViewerElement } from "@/types/model-viewer";
import { IconClose, IconCube, IconReset } from "@/components/icons";

interface Props {
  t: Strings;
  dish: Dish;
  notice?: string;
  onCameraFailure: (reason: CameraFailureReason) => void;
  onUse3d: () => void;
  onClose: () => void;
}

interface Offset {
  x: number;
  y: number;
}

const INITIAL_OFFSET: Offset = { x: 0, y: 0 };

function waitForFirstVideoFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    function finish(error?: Error) {
      clearTimeout(timeout);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("playing", onReady);
      video.removeEventListener("error", onError);
      if (error) reject(error);
      else resolve();
    }

    function onReady() {
      if (video.videoWidth > 0 && video.videoHeight > 0) finish();
    }

    function onError() {
      finish(new Error("Camera video error"));
    }

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("playing", onReady);
    video.addEventListener("error", onError, { once: true });
    const timeout = setTimeout(() => finish(new Error("Camera frame timeout")), 5_000);
  });
}

export default function ArLiteExperience({
  t,
  dish,
  notice,
  onCameraFailure,
  onUse3d,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState<Offset>(INITIAL_OFFSET);
  const [instanceKey, setInstanceKey] = useState(0);
  const { defined, state, progress } = useModelViewerLifecycle(
    viewerRef,
    dish.modelGlbUrl,
    instanceKey,
  );

  useEffect(() => {
    if (state === "error") onUse3d();
  }, [onUse3d, state]);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let endedTracks: MediaStreamTrack[] = [];
    const video = videoRef.current;

    const fail = (reason: CameraFailureReason) => {
      if (active) onCameraFailure(reason);
    };
    const onTrackEnded = () => fail("unknown");
    const onTrackMuted = () => {
      if (active) setCameraReady(false);
    };
    const onTrackUnmuted = () => {
      if (active) setCameraReady(true);
    };
    const onPageHide = () => {
      if (stream) stopCameraStream(stream);
      fail("unknown");
    };

    const requestTimer = setTimeout(() => {
      void requestEnvironmentCamera().then(async (result) => {
        if (!result.ok) {
          fail(result.reason);
          return;
        }

        if (!active) {
          stopCameraStream(result.stream);
          return;
        }

        stream = result.stream;
        endedTracks = stream.getVideoTracks();
        endedTracks.forEach((track) => {
          track.addEventListener("ended", onTrackEnded);
          track.addEventListener("mute", onTrackMuted);
          track.addEventListener("unmute", onTrackUnmuted);
        });

        if (!video) {
          stopCameraStream(stream);
          fail("unknown");
          return;
        }

        video.srcObject = stream;
        try {
          await video.play();
          await waitForFirstVideoFrame(video);
          if (active) setCameraReady(true);
        } catch {
          stopCameraStream(stream);
          fail("unknown");
        }
      });
    }, 0);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      active = false;
      clearTimeout(requestTimer);
      window.removeEventListener("pagehide", onPageHide);
      endedTracks.forEach((track) => {
        track.removeEventListener("ended", onTrackEnded);
        track.removeEventListener("mute", onTrackMuted);
        track.removeEventListener("unmute", onTrackUnmuted);
      });
      if (stream) stopCameraStream(stream);
      if (video) video.srcObject = null;
    };
  }, [onCameraFailure]);

  const resetPlacement = () => {
    setScale(1);
    setRotation(0);
    setOffset(INITIAL_OFFSET);
    setPlaced(false);
  };

  const nudge = (x: number, y: number) => {
    setOffset((current) => ({
      x: Math.max(-84, Math.min(84, current.x + x)),
      y: Math.max(-84, Math.min(84, current.y + y)),
    }));
  };

  const resize = (delta: number) => {
    setScale((current) => Math.max(0.65, Math.min(1.5, current + delta)));
  };

  const rotate = (delta: number) => {
    setRotation((current) => (current + delta + 360) % 360);
  };

  const modelTransform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`;

  return (
    <div
      className="ar-lite anim-fade-in"
      data-screen-root="experience"
      tabIndex={-1}
      aria-label={`${t.arLite}: ${dish.name}`}
    >
      <video ref={videoRef} className="ar-lite__video" autoPlay muted playsInline aria-hidden="true" />
      <div className="ar-lite__camera-scrim" />

      {defined && dish.modelGlbUrl && (
        <div
          className={`ar-lite__model-anchor${placed ? " ar-lite__model-anchor--placed" : ""}`}
          style={{ transform: modelTransform }}
          inert={!placed}
          aria-hidden={!placed}
        >
          <model-viewer
            key={instanceKey}
            ref={viewerRef}
            className="ar-lite__mv"
            tabIndex={-1}
            src={dish.modelGlbUrl}
            alt={dish.name}
            touch-action="none"
            shadow-intensity="1.4"
            shadow-softness="0.9"
            exposure="1.1"
            environment-image="neutral"
            camera-orbit={`${rotation}deg 75deg auto`}
            interaction-prompt="none"
            loading="eager"
          />
        </div>
      )}

      {!placed && (
        <div className="ar-lite__reticle" aria-hidden="true">
          <span />
        </div>
      )}

      <div className="experience__topbar">
        <button type="button" className="hud-btn hud-btn--lg" aria-label={t.close} onClick={onClose}>
          <IconClose size={17} />
        </button>
        <div className="experience__badge experience__badge--lite">
          <IconCube size={14} strokeWidth={1.9} />
          {t.arLite}
        </div>
      </div>

      <div className="ar-lite__guidance" aria-live="polite">
        <strong>{notice ?? t.arLiteActivated}</strong>
        <span>{cameraReady ? (placed ? t.dishPlaced : t.arLiteAim) : t.cameraNeeded}</span>
      </div>

      {state === "error" && (
        <div className="experience__error" role="alert">
          <div>{t.modelError}</div>
          <button type="button" className="glass-btn" onClick={() => setInstanceKey((current) => current + 1)}>
            {t.retry}
          </button>
          <button type="button" className="glass-btn" onClick={onUse3d}>
            {t.use3dInstead}
          </button>
        </div>
      )}

      <div className="ar-lite__bottom">
        {!placed ? (
          <div className="ar-lite__place-card">
            {(state === "registering" || state === "loading") && (
              <div className="ar-lite__load-line">
                {t.preparing} {state === "loading" ? `${Math.round(progress * 100)}%` : ""}
              </div>
            )}
            {!cameraReady && <div className="ar-lite__load-line">{t.cameraStarting}</div>}
            <button
              type="button"
              className="btn-primary"
              disabled={!cameraReady || state !== "ready"}
              onClick={() => setPlaced(true)}
            >
              <IconCube size={16} />
              {t.placeHere}
            </button>
            <button type="button" className="ar-lite__text-action" onClick={onUse3d}>
              {t.use3dInstead}
            </button>
          </div>
        ) : (
          <div className="ar-lite__controls">
            <div className="ar-lite__control-group">
              <span>{t.rotateDish}</span>
              <div>
                <button type="button" aria-label={t.rotateLeft} onClick={() => rotate(-15)}>
                  ↶
                </button>
                <output aria-live="polite" aria-label={`${t.rotateDish}: ${rotation}°`}>
                  {rotation}°
                </output>
                <button type="button" aria-label={t.rotateRight} onClick={() => rotate(15)}>
                  ↷
                </button>
              </div>
            </div>

            <div className="ar-lite__control-group">
              <span>{t.resizeDish}</span>
              <div>
                <button type="button" aria-label={t.smaller} onClick={() => resize(-0.1)}>
                  −
                </button>
                <output
                  aria-live="polite"
                  aria-label={`${t.resizeDish}: ${Math.round(scale * 100)}%`}
                >
                  {Math.round(scale * 100)}%
                </output>
                <button type="button" aria-label={t.larger} onClick={() => resize(0.1)}>
                  +
                </button>
              </div>
            </div>

            <div className="ar-lite__move-group" aria-label={t.moveDish}>
              <button type="button" aria-label={t.moveLeft} onClick={() => nudge(-14, 0)}>
                ←
              </button>
              <button type="button" aria-label={t.moveUp} onClick={() => nudge(0, -14)}>
                ↑
              </button>
              <button type="button" aria-label={t.moveDown} onClick={() => nudge(0, 14)}>
                ↓
              </button>
              <button type="button" aria-label={t.moveRight} onClick={() => nudge(14, 0)}>
                →
              </button>
            </div>

            <div className="ar-lite__footer-actions">
              <button type="button" className="glass-btn" onClick={resetPlacement}>
                <IconReset size={14} />
                {t.reset}
              </button>
              <button type="button" className="glass-btn" onClick={onUse3d}>
                {t.use3dInstead}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
