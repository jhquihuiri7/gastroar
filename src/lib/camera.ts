export type CameraFailureReason =
  | "permission-denied"
  | "unavailable"
  | "busy"
  | "insecure"
  | "unknown";

export type CameraRequestResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; reason: CameraFailureReason; error?: unknown };

interface NativeSettingsHandler {
  postMessage(message: null): void;
}

type WindowWithNativeSettingsBridge = Window & {
  webkit?: {
    messageHandlers?: {
      openSettings?: NativeSettingsHandler;
    };
  };
};

function classifyCameraFailure(error: unknown): CameraFailureReason {
  if (!(error instanceof DOMException)) {
    return "unknown";
  }

  switch (error.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "permission-denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "unavailable";
    case "NotReadableError":
    case "TrackStartError":
      return "busy";
    default:
      return "unknown";
  }
}

function getNativeSettingsHandler(): NativeSettingsHandler | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const nativeWindow = window as WindowWithNativeSettingsBridge;
  const handler = nativeWindow.webkit?.messageHandlers?.openSettings;
  return typeof handler?.postMessage === "function" ? handler : undefined;
}

export async function requestEnvironmentCamera(): Promise<CameraRequestResult> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  if (window.isSecureContext === false) {
    return { ok: false, reason: "insecure" };
  }

  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices || typeof mediaDevices.getUserMedia !== "function") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    const stream = await mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
    return { ok: true, stream };
  } catch (error) {
    return { ok: false, reason: classifyCameraFailure(error), error };
  }
}

export function stopCameraStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function hasNativeSettingsBridge(): boolean {
  return getNativeSettingsHandler() !== undefined;
}

export function openNativeSettings(): boolean {
  const handler = getNativeSettingsHandler();
  if (!handler) {
    return false;
  }

  try {
    handler.postMessage(null);
    return true;
  } catch {
    return false;
  }
}
