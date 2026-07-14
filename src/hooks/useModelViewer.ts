"use client";

import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import type {
  ModelViewerElement,
  ModelViewerProgressEvent,
} from "@/types/model-viewer";

export type ModelLoadState = "registering" | "loading" | "ready" | "error";

type RegistrationState = "registering" | "defined" | "error";

interface RegistrationSnapshot {
  instanceKey: number | undefined;
  state: RegistrationState;
}

interface ModelIdentity {
  source: string | undefined;
  instanceKey: number | undefined;
}

interface ModelSnapshot {
  identity: ModelIdentity;
  state: Exclude<ModelLoadState, "registering">;
  progress: number;
}

const MODEL_VIEWER_TAG = "model-viewer";

let registrationPromise: Promise<void> | undefined;
const LOAD_TIMEOUT_MS = 30_000;

function registerModelViewer(): Promise<void> {
  if (registrationPromise) return registrationPromise;

  if (typeof window === "undefined" || !("customElements" in window)) {
    registrationPromise = Promise.reject(
      new Error("Custom elements are unavailable in this environment."),
    );
    return registrationPromise;
  }

  const registry = window.customElements;
  registrationPromise = (registry.get(MODEL_VIEWER_TAG)
    ? Promise.resolve()
    : import("@google/model-viewer")
        .then(() => registry.whenDefined(MODEL_VIEWER_TAG))
        .then(() => undefined)
  ).catch((error: unknown) => {
    registrationPromise = undefined;
    throw error;
  });

  return registrationPromise;
}

function normalizeProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function useModelViewerLifecycle(
  ref: RefObject<ModelViewerElement | null>,
  source: string | undefined,
  instanceKey?: number,
): { defined: boolean; state: ModelLoadState; progress: number } {
  const [registrationSnapshot, setRegistrationSnapshot] = useState<RegistrationSnapshot>(() => ({
    instanceKey,
    state: "registering",
  }));
  const identity = useMemo<ModelIdentity>(
    () => ({ source, instanceKey }),
    [instanceKey, source],
  );
  const [snapshot, setSnapshot] = useState<ModelSnapshot>(() => ({
    identity,
    state: "loading",
    progress: 0,
  }));

  useEffect(() => {
    let active = true;

    void registerModelViewer().then(
      () => {
        if (active) setRegistrationSnapshot({ instanceKey, state: "defined" });
      },
      () => {
        if (active) setRegistrationSnapshot({ instanceKey, state: "error" });
      },
    );

    return () => {
      active = false;
    };
  }, [instanceKey]);

  const registration =
    registrationSnapshot.instanceKey === instanceKey
      ? registrationSnapshot.state
      : "registering";
  const defined = registration === "defined";

  useEffect(() => {
    if (!defined) return;

    const element = ref.current;
    if (!element) return;

    let active = true;
    let terminal = false;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;

    const clearLoadTimeout = () => {
      if (loadTimeout) clearTimeout(loadTimeout);
      loadTimeout = undefined;
    };
    const armLoadTimeout = () => {
      clearLoadTimeout();
      loadTimeout = setTimeout(() => {
        if (active) {
          terminal = true;
          setSnapshot({ identity, state: "error", progress: 0 });
        }
      }, LOAD_TIMEOUT_MS);
    };

    const onProgress = (event: Event) => {
      if (!active || terminal) return;

      const detail = (event as ModelViewerProgressEvent).detail;
      if (detail.reason !== "model-load") return;
      armLoadTimeout();

      setSnapshot({
        identity,
        state: "loading",
        progress: normalizeProgress(detail.totalProgress),
      });
    };
    const onLoad = () => {
      if (!active) return;
      terminal = true;
      clearLoadTimeout();
      setSnapshot({ identity, state: "ready", progress: 1 });
    };
    const onError = () => {
      if (!active) return;
      terminal = true;
      clearLoadTimeout();

      setSnapshot((current) => ({
        identity,
        state: "error",
        progress: current.identity === identity ? current.progress : 0,
      }));
    };

    element.addEventListener("progress", onProgress);
    element.addEventListener("load", onLoad);
    element.addEventListener("error", onError);
    armLoadTimeout();
    if (element.loaded) onLoad();

    return () => {
      active = false;
      clearLoadTimeout();
      element.removeEventListener("progress", onProgress);
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
    };
  }, [defined, identity, ref]);

  if (registration === "registering") {
    return { defined: false, state: "registering", progress: 0 };
  }

  if (registration === "error") {
    return { defined: false, state: "error", progress: 0 };
  }

  if (snapshot.identity !== identity) {
    return { defined: true, state: "loading", progress: 0 };
  }

  return { defined: true, state: snapshot.state, progress: snapshot.progress };
}
