import type { HTMLAttributes, Key, Ref } from "react";

/**
 * <model-viewer> es un custom element, no un elemento de React. TS no lo conoce,
 * así que declaramos aquí los atributos que usamos y la forma del elemento.
 *
 * Solo exponemos la superficie que realmente tocamos desde ArViewScreen; el tipo
 * completo vive en @google/model-viewer, pero importarlo arrastra los tipos de
 * three.js a la compilación sin darnos nada a cambio.
 */
export interface ModelViewerElement extends HTMLElement {
  /** True once the current model has finished loading. */
  readonly loaded: boolean;
  /** false en desktop y en webviews in-app (Instagram, Facebook…). */
  readonly canActivateAR: boolean;
  /** Lanza la sesión AR. Debe llamarse desde un gesto del usuario. */
  activateAR(): Promise<void>;
  /** Devuelve la cámara orbital a su posición inicial. */
  resetTurntableRotation(radians?: number): void;
  cameraOrbit: string;
  jumpCameraToGoal(): void;
}

/** detail del evento "progress": totalProgress va de 0 a 1. */
export interface ModelViewerProgressEvent extends CustomEvent {
  detail: {
    totalProgress: number;
    reason: "model-load" | "environment-update" | "usdz-conversion" | "variant-update" | string;
  };
}

/** detail del evento "ar-status". */
export type ArStatus = "not-presenting" | "session-started" | "object-placed" | "failed";

export interface ModelViewerArStatusEvent extends CustomEvent {
  detail: { status: ArStatus };
}

interface ModelViewerAttributes extends HTMLAttributes<HTMLElement> {
  key?: Key;
  ref?: Ref<ModelViewerElement>;
  src?: string;
  "ios-src"?: string;
  alt?: string;
  poster?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-placement"?: "floor" | "wall";
  "ar-scale"?: "auto" | "fixed";
  "ar-usdz-max-texture-size"?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
  exposure?: string;
  "environment-image"?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "interaction-prompt"?: "auto" | "none";
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "disable-zoom"?: boolean;
  "disable-pan"?: boolean;
  "auto-rotate"?: boolean;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
