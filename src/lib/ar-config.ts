export type Vector3Tuple = [number, number, number];

/** Configuration for the printed image target that accompanies the table QR. */
export interface ArMarkerConfig {
  targetUrl: string;
  previewUrl: string;
  /** Physical width of the tracked artwork, excluding the QR beside it. */
  physicalWidthMm: number;
  version: string;
}

/** Per-model calibration. Coordinates are relative to the printed target. */
export interface DishArCalibration {
  /** Real-world width, height and depth. Width is used to normalize the GLB. */
  realSizeMm?: Vector3Tuple;
  /** Fine adjustment after metric normalization. It should normally stay at 1. */
  scaleCorrection?: number;
  /** Right, toward the top of the printed target, and away from the table, in mm. */
  anchorOffsetMm?: Vector3Tuple;
  /** Model rotation in degrees. X=90 maps a Y-up GLB onto the target's table plane. */
  rotationDeg?: Vector3Tuple;
}

export const DEFAULT_AR_MARKER: ArMarkerConfig = {
  targetUrl: "/assets/markers/gastroar-card-v1.mind",
  previewUrl: "/assets/markers/gastroar-card-v1.png",
  physicalWidthMm: 90,
  version: "gastroar-card-v1",
};

export const DEFAULT_DISH_AR_CALIBRATION: Required<
  Pick<DishArCalibration, "scaleCorrection" | "anchorOffsetMm" | "rotationDeg">
> = {
  scaleCorrection: 1,
  // The dish is centered on the tracked artwork and rises along its normal.
  anchorOffsetMm: [0, 0, 0],
  rotationDeg: [90, 0, 0],
};

const LEGACY_OFF_MARKER_OFFSET: Vector3Tuple = [0, -120, 0];

function normalizedAnchorOffset(calibration?: DishArCalibration): Vector3Tuple {
  const offset = calibration?.anchorOffsetMm;
  if (!offset) return DEFAULT_DISH_AR_CALIBRATION.anchorOffsetMm;

  // Earlier releases used this exact value as their default, placing every
  // dish 120 mm below the reference. Treat persisted copies as legacy data.
  if (offset.every((value, index) => value === LEGACY_OFF_MARKER_OFFSET[index])) {
    return DEFAULT_DISH_AR_CALIBRATION.anchorOffsetMm;
  }
  return offset;
}

export function normalizeMarkerConfig(config?: Partial<ArMarkerConfig>): ArMarkerConfig {
  const width = Number(config?.physicalWidthMm);
  return {
    targetUrl: config?.targetUrl || DEFAULT_AR_MARKER.targetUrl,
    previewUrl: config?.previewUrl || DEFAULT_AR_MARKER.previewUrl,
    physicalWidthMm:
      Number.isFinite(width) && width >= 40 && width <= 300
        ? width
        : DEFAULT_AR_MARKER.physicalWidthMm,
    version: config?.version || DEFAULT_AR_MARKER.version,
  };
}

export function normalizeTableId(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60);
  return normalized || undefined;
}

export function normalizeDishCalibration(
  calibration?: DishArCalibration,
): Required<Pick<DishArCalibration, "scaleCorrection" | "anchorOffsetMm" | "rotationDeg">> &
  Pick<DishArCalibration, "realSizeMm"> {
  const correction = Number(calibration?.scaleCorrection);
  return {
    realSizeMm: calibration?.realSizeMm,
    scaleCorrection:
      Number.isFinite(correction) && correction >= 0.1 && correction <= 10
        ? correction
        : DEFAULT_DISH_AR_CALIBRATION.scaleCorrection,
    anchorOffsetMm: normalizedAnchorOffset(calibration),
    rotationDeg: calibration?.rotationDeg ?? DEFAULT_DISH_AR_CALIBRATION.rotationDeg,
  };
}
