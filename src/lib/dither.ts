/**
 * 1-bit ordered dithering of tonelabs' beams, for the Tonelabs row: a small
 * window into tonelabs.io. Ported from tonelabs' `src/scripts/dither.ts`
 * without its pointer lens (this site never reacts to the cursor). Pure
 * functions with erasable TypeScript only, so `node --test` imports it.
 */
import { BAYER_8 } from "./bayer.ts";

export type IntensityFn = (
  x: number,
  y: number,
  t: number,
  width: number,
  height: number,
) => number;

export type Rgba = readonly [number, number, number, number];

function hash3(x: number, y: number, z: number): number {
  let h =
    Math.imul(x, 374761393) ^
    Math.imul(y, 668265263) ^
    Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

const fade = (t: number): number => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Smooth 3D value noise in 0–1. */
export function valueNoise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const w = fade(z - zi);

  const c000 = hash3(xi, yi, zi);
  const c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi);
  const c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1);
  const c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1);
  const c111 = hash3(xi + 1, yi + 1, zi + 1);

  return lerp(
    lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
    lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
    w,
  );
}

const BEAM_ANGLE = (30 * Math.PI) / 180;
const BEAM_COS = Math.cos(BEAM_ANGLE);
const BEAM_SIN = Math.sin(BEAM_ANGLE);
/** Beam spacing in cells; fixed so a short, wide row still shows several. */
const BEAM_SPAN = 26;

/**
 * Tilted light slats, each with a wavering edge, a bright leading fold, and
 * highlights sliding along it (tonelabs' hero beams).
 */
export const beamsIntensity: IntensityFn = (x, y, t, width, height) => {
  const cx = x - width / 2;
  const cy = y - height / 2;
  const u = cx * BEAM_COS + cy * BEAM_SIN;
  const v = -cx * BEAM_SIN + cy * BEAM_COS;

  const raw = u / BEAM_SPAN;
  const index = Math.floor(raw);
  const wave = (valueNoise3(v * 0.018, index * 3.7, t * 0.35) - 0.5) * 0.7;
  const across = raw + wave - Math.floor(raw + wave);

  const fold = Math.pow(1 - across, 2.2);
  const travel = valueNoise3(index * 5.1, v * 0.012 - t * 0.45, t * 0.1);
  return clamp01(fold * (0.25 + travel * 1.1));
};

/**
 * Thresholds `intensity × density` against the Bayer matrix and writes lit
 * pixels as `color` (unlit pixels stay transparent) into an RGBA buffer.
 */
export function renderDither(
  buffer: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: IntensityFn,
  t: number,
  color: Rgba,
  density = 1,
): void {
  const [r, g, b, a] = color;
  let i = 0;
  for (let y = 0; y < height; y++) {
    const row = (y & 7) * 8;
    for (let x = 0; x < width; x++) {
      const threshold = ((BAYER_8[row + (x & 7)] ?? 0) + 0.5) / 64;
      const lit = intensity(x, y, t, width, height) * density > threshold;
      buffer[i] = r;
      buffer[i + 1] = g;
      buffer[i + 2] = b;
      buffer[i + 3] = lit ? a : 0;
      i += 4;
    }
  }
}
