"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
  type Material,
  type Object3D,
  type Texture,
} from "three-mindar";
import { GLTFLoader } from "three-mindar/addons/loaders/GLTFLoader.js";

import { IconClose, IconCube, IconReset } from "@/components/icons";
import {
  normalizeDishCalibration,
  normalizeMarkerConfig,
  type ArMarkerConfig,
} from "@/lib/ar-config";
import type { CameraFailureReason } from "@/lib/camera";
import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import type { MindARAnchor, MindARThree } from "@/vendor/mind-ar/mindar-image-three.prod.js";

interface Props {
  t: Strings;
  dish: Dish;
  marker: ArMarkerConfig;
  tableId?: string;
  notice?: string;
  onCameraFailure: (reason: CameraFailureReason) => void;
  onUse3d: () => void;
  onClose: () => void;
}

type TrackingState = "initializing" | "scanning" | "tracking" | "limited";
type Point = { x: number; y: number };

interface GestureBase {
  center: Point;
  angle: number;
  count: number;
  x: number;
  y: number;
  heading: number;
}

function centerOf(points: Point[]): Point {
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), {
    x: 0,
    y: 0,
  });
  return { x: total.x / points.length, y: total.y / points.length };
}

async function classifyStartFailure(error: unknown): Promise<CameraFailureReason> {
  if (typeof window !== "undefined" && !window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";
  if (error instanceof DOMException) {
    if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(error.name)) {
      return "permission-denied";
    }
    if (["NotFoundError", "OverconstrainedError"].includes(error.name)) return "unavailable";
    if (["NotReadableError", "TrackStartError"].includes(error.name)) return "busy";
  }
  try {
    const permission = await navigator.permissions?.query({ name: "camera" as PermissionName });
    if (permission?.state === "denied") return "permission-denied";
  } catch {
    // Safari does not expose the camera permission through Permissions API.
  }
  return "unknown";
}

function disposeObject(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    mesh.geometry?.dispose?.();
    const materials: Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value && typeof value === "object" && "isTexture" in value) {
          (value as Texture).dispose();
        }
      }
      material.dispose();
    }
  });
}

export default function ArLiteExperience({
  t,
  dish,
  marker: markerInput,
  tableId,
  notice,
  onCameraFailure,
  onUse3d,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<MindARThree | null>(null);
  const anchorRef = useRef<MindARAnchor | null>(null);
  const placementRef = useRef<Group | null>(null);
  const basePlacementRef = useRef({ x: 0, y: 0, z: 0, heading: 0 });
  const livePlacementRef = useRef({ x: 0, y: 0, heading: 0 });
  const pointersRef = useRef(new Map<number, Point>());
  const gestureBaseRef = useRef<GestureBase | null>(null);
  const [tracking, setTracking] = useState<TrackingState>("initializing");
  const [modelProgress, setModelProgress] = useState(0);
  const marker = normalizeMarkerConfig(markerInput);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !dish.modelGlbUrl) {
      onUse3d();
      return;
    }
    const host: HTMLElement = container;
    const activePointers = pointersRef.current;

    let active = true;
    let engine: MindARThree | null = null;
    let modelRoot: Object3D | null = null;
    let holdUntil = 0;
    const lastMatrix = new Matrix4();

    async function start() {
      if (!window.isSecureContext) {
        onCameraFailure("insecure");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        onCameraFailure("unavailable");
        return;
      }

      try {
        const [{ MindARThree: MindAR }, gltf] = await Promise.all([
          import("@/vendor/mind-ar/mindar-image-three.prod.js"),
          new Promise<Awaited<ReturnType<GLTFLoader["loadAsync"]>>>((resolve, reject) => {
            new GLTFLoader().load(
              dish.modelGlbUrl!,
              resolve,
              (event) => {
                if (!active || !event.total) return;
                setModelProgress(Math.min(1, event.loaded / event.total));
              },
              reject,
            );
          }),
        ]);
        if (!active) {
          disposeObject(gltf.scene);
          return;
        }

        engine = new MindAR({
          container: host,
          imageTargetSrc: marker.targetUrl,
          maxTrack: 1,
          uiLoading: "no",
          uiScanning: "no",
          uiError: "no",
          filterMinCF: 0.002,
          filterBeta: 20,
          warmupTolerance: 3,
          missTolerance: 8,
        });
        engineRef.current = engine;
        engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        engine.renderer.shadowMap.enabled = true;

        const anchor = engine.addAnchor(0);
        anchorRef.current = anchor;
        const placement = new Group();
        placementRef.current = placement;
        anchor.group.add(placement);

        const calibration = normalizeDishCalibration(dish.arCalibration);
        const markerWidthM = marker.physicalWidthMm / 1_000;
        const [offsetX, offsetY, offsetZ] = calibration.anchorOffsetMm;
        const baseX = offsetX / marker.physicalWidthMm;
        const baseY = offsetY / marker.physicalWidthMm;
        const baseZ = offsetZ / marker.physicalWidthMm;
        basePlacementRef.current = { x: baseX, y: baseY, z: baseZ, heading: 0 };
        livePlacementRef.current = { x: baseX, y: baseY, heading: 0 };
        placement.position.set(baseX, baseY, baseZ);

        modelRoot = gltf.scene;
        const box = new Box3().setFromObject(modelRoot);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        modelRoot.position.set(-center.x, -box.min.y, -center.z);
        const desiredWidthM = calibration.realSizeMm?.[0]
          ? calibration.realSizeMm[0] / 1_000
          : size.x;
        const sourceToMeters = calibration.realSizeMm?.[0] && size.x > 0
          ? desiredWidthM / size.x
          : 1;
        const targetScale = (sourceToMeters / markerWidthM) * calibration.scaleCorrection;
        modelRoot.scale.setScalar(targetScale);
        modelRoot.rotation.set(
          MathUtils.degToRad(calibration.rotationDeg[0]),
          MathUtils.degToRad(calibration.rotationDeg[1]),
          MathUtils.degToRad(calibration.rotationDeg[2]),
        );
        modelRoot.traverse((child) => {
          const mesh = child as Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        placement.add(modelRoot);

        const realWidthUnits = desiredWidthM / markerWidthM;
        const shadow = new Mesh(
          new PlaneGeometry(Math.max(realWidthUnits * 1.35, 0.5), Math.max(realWidthUnits * 1.35, 0.5)),
          new ShadowMaterial({ color: 0x000000, opacity: 0.28 }),
        );
        shadow.position.z = 0.002;
        shadow.receiveShadow = true;
        placement.add(shadow);

        engine.scene.add(new AmbientLight(0xffffff, 2.2));
        const keyLight = new DirectionalLight(0xfff1d6, 3.4);
        keyLight.position.set(-2, -1, 4);
        keyLight.castShadow = true;
        engine.scene.add(keyLight);

        anchor.onTargetFound = () => {
          holdUntil = 0;
          if (active) setTracking("tracking");
        };
        anchor.onTargetLost = () => {
          holdUntil = performance.now() + 350;
          if (active) setTracking("limited");
        };
        anchor.onTargetUpdate = () => {
          if (anchor.visible) lastMatrix.copy(anchor.group.matrix);
        };

        await engine.start();
        if (!active) return;
        setModelProgress(1);
        setTracking(anchor.visible ? "tracking" : "scanning");
        engine.renderer.setAnimationLoop(() => {
          if (!engine || !anchor) return;
          if (!anchor.visible && holdUntil > performance.now()) {
            anchor.group.matrix.copy(lastMatrix);
            anchor.group.visible = true;
          } else if (!anchor.visible && holdUntil !== 0) {
            anchor.group.visible = false;
            holdUntil = 0;
            if (active) setTracking("scanning");
          }
          engine.renderer.render(engine.scene, engine.camera);
        });
      } catch (error) {
        if (!active) return;
        if (engine) onCameraFailure(await classifyStartFailure(error));
        else onUse3d();
      }
    }

    void start();
    return () => {
      active = false;
      activePointers.clear();
      try {
        engine?.renderer.setAnimationLoop(null);
        engine?.stop();
      } catch {
        // The engine can be disposed before camera initialization completes.
      }
      if (modelRoot) disposeObject(modelRoot);
      engine?.renderer.dispose();
      engineRef.current = null;
      anchorRef.current = null;
      placementRef.current = null;
      host.replaceChildren();
    };
  }, [dish.arCalibration, dish.modelGlbUrl, marker.physicalWidthMm, marker.targetUrl, onCameraFailure, onUse3d]);

  const beginGesture = () => {
    const points = [...pointersRef.current.values()];
    if (!points.length) {
      gestureBaseRef.current = null;
      return;
    }
    const [first, second] = points;
    const live = livePlacementRef.current;
    gestureBaseRef.current = {
      center: centerOf(points),
      angle: second ? Math.atan2(second.y - first.y, second.x - first.x) : 0,
      count: points.length,
      x: live.x,
      y: live.y,
      heading: live.heading,
    };
  };

  const applyGesture = () => {
    const placement = placementRef.current;
    const base = gestureBaseRef.current;
    const container = containerRef.current;
    const points = [...pointersRef.current.values()];
    if (!placement || !base || !container || !points.length) return;

    const center = centerOf(points);
    const unitPerPixel = 2 / Math.max(container.clientWidth, 1);
    const x = Math.max(-3, Math.min(3, base.x + (center.x - base.center.x) * unitPerPixel));
    const y = Math.max(-3, Math.min(3, base.y - (center.y - base.center.y) * unitPerPixel));
    let heading = base.heading;
    if (base.count >= 2 && points.length >= 2) {
      const [first, second] = points;
      heading += Math.atan2(second.y - first.y, second.x - first.x) - base.angle;
    }
    placement.position.x = x;
    placement.position.y = y;
    placement.rotation.z = heading;
    livePlacementRef.current = { x, y, heading };
  };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (tracking !== "tracking") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    beginGesture();
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    applyGesture();
  };
  const pointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    beginGesture();
  };

  const resetPlacement = () => {
    const placement = placementRef.current;
    const base = basePlacementRef.current;
    if (!placement) return;
    placement.position.set(base.x, base.y, base.z);
    placement.rotation.z = base.heading;
    livePlacementRef.current = { x: base.x, y: base.y, heading: base.heading };
  };

  const statusText = tracking === "tracking"
    ? t.markerFound
    : tracking === "limited"
      ? t.markerLost
      : tracking === "initializing"
        ? t.markerInitializing
        : t.markerAim;

  return (
    <div className="ar-lite marker-ar anim-fade-in" data-screen-root="experience" tabIndex={-1} aria-label={`${t.arLite}: ${dish.name}`}>
      <div ref={containerRef} className="marker-ar__stage" />
      <div className="ar-lite__camera-scrim" />
      <div className="marker-ar__gesture-layer" aria-hidden="true" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} />

      {(tracking === "scanning" || tracking === "initializing" || tracking === "limited") && (
        <div className={`marker-ar__finder${tracking === "limited" ? " marker-ar__finder--lost" : ""}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={marker.previewUrl} alt="" />
        </div>
      )}

      <div className="experience__topbar marker-ar__topbar">
        <button type="button" className="hud-btn hud-btn--lg" aria-label={t.close} onClick={onClose}><IconClose size={17} /></button>
        <div className="experience__badge experience__badge--lite"><IconCube size={14} strokeWidth={1.9} />{t.arLite}</div>
      </div>

      <div className="ar-lite__guidance marker-ar__guidance" aria-live="polite">
        <strong>{notice ?? (tableId ? `${t.tableLabel} ${tableId}` : t.arLiteActivated)}</strong>
        <span>{statusText}</span>
      </div>

      <div className="ar-lite__bottom marker-ar__bottom">
        <div className="marker-ar__status-card">
          {tracking === "initializing" && <div className="ar-lite__load-line">{t.preparing} {Math.round(modelProgress * 100)}%</div>}
          {tracking === "tracking" ? <div className="hint-pill">{t.markerGestureHint}</div> : <div className="marker-ar__hint">{t.markerHint}</div>}
          <div className="marker-ar__actions">
            <span>{t.realSizeLocked}</span>
            <button type="button" className="glass-btn" onClick={resetPlacement} disabled={tracking !== "tracking"}><IconReset size={14} />{t.reset}</button>
            <button type="button" className="glass-btn" onClick={onUse3d}>{t.use3dInstead}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
