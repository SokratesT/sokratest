import type { Size } from "@docling/docling-core";

export interface ImageValidationResult {
  isValid: boolean;
  width?: number;
  height?: number;
  error?: string;
}

const IMAGE_VALIDATION_DEFAULTS = {
  // Units in pixels
  MIN_WIDTH: 100,
  MIN_HEIGHT: 100,
  MIN_SINGLE_DIMENSION: 50, // prevents very narrow/flat images
} as const;

/**
 * Validates if an image meets minimum resolution requirements.
 *
 * Images must be at least MIN_SINGLE_DIMENSION pixels in both dimensions
 * AND at least MIN_WIDTH or MIN_HEIGHT in either width or height
 * to be considered valid.
 *
 * @param size - The image dimensions to validate
 * @param upscaleFactor - Multiplier for minimum thresholds (default: 1)
 * @returns Validation result with dimensions
 */
export function validateImageResolution(
  size: Size,
  upscaleFactor = 1,
): ImageValidationResult {
  const minWidth = IMAGE_VALIDATION_DEFAULTS.MIN_WIDTH * upscaleFactor;
  const minHeight = IMAGE_VALIDATION_DEFAULTS.MIN_HEIGHT * upscaleFactor;
  const minSingleDimension =
    IMAGE_VALIDATION_DEFAULTS.MIN_SINGLE_DIMENSION * upscaleFactor;

  const width = size.width ?? 0;
  const height = size.height ?? 0;

  const isValidResolution =
    (width >= minWidth || height >= minHeight) &&
    width > minSingleDimension &&
    height > minSingleDimension;

  return {
    isValid: isValidResolution,
    width,
    height,
  };
}
