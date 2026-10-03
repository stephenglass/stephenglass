/**
 * Pixel art as rows of characters: one character per cell, "." is empty.
 * Pure helpers shared by the build-time SVG components and the brand-asset
 * script.
 */
import { bayerOn } from "./bayer.ts";

export type Pixels = readonly string[];

export interface Run {
  x: number;
  y: number;
  width: number;
  /** The cell character, used as a palette key. */
  key: string;
}

/** Merge each row's same-key cells into horizontal runs: one rect per run. */
export function toRuns(pixels: Pixels): Run[] {
  const runs: Run[] = [];
  pixels.forEach((row, y) => {
    for (const match of row.matchAll(/([^.])\1*/g)) {
      runs.push({
        x: match.index,
        y,
        width: match[0].length,
        key: match[1] ?? "",
      });
    }
  });
  return runs;
}

export const sizeOf = (pixels: Pixels): { width: number; height: number } => ({
  width: Math.max(...pixels.map((row) => row.length)),
  height: pixels.length,
});

/** An SVG string for the pixels; `palette` maps cell keys to fills. */
export function toSvg(
  pixels: Pixels,
  palette: Readonly<Record<string, string>>,
  scale = 1,
): string {
  const { width, height } = sizeOf(pixels);
  const rects = toRuns(pixels)
    .map(
      (run) =>
        `<rect x="${run.x}" y="${run.y}" width="${run.width}" height="1" fill="${palette[run.key] ?? "currentColor"}"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${rects}</svg>`;
}

/** The pixels with some keys swapped for others. */
export const recolor = (
  pixels: Pixels,
  keys: Readonly<Record<string, string>>,
): Pixels =>
  pixels.map((row) => [...row].map((cell) => keys[cell] ?? cell).join(""));

/**
 * Light `k` cells from the top right in 1-bit: cells within `reach` of an
 * edge facing right (or up, on the top four rows) fade toward `d`,
 * ordered-dithered like the Tonelabs row. Thin strokes stay mostly dark.
 * Same size; other keys untouched.
 */
export function withLight(
  pixels: Pixels,
  reach: number,
  strength: number,
): Pixels {
  const empty = (x: number, y: number): boolean =>
    (pixels[y]?.[x] ?? ".") === ".";
  return pixels.map((row, y) =>
    [...row]
      .map((cell, x) => {
        if (cell !== "k") return cell;
        let depth = reach;
        for (let i = 1; i <= reach; i++) {
          const top = y < 4 && empty(x, y - i);
          if (empty(x + i, y - i) || empty(x + i, y) || top) {
            depth = i - 1;
            break;
          }
        }
        if (depth > 0 && empty(x - 1, y) && empty(x + 1, y + 1)) depth = reach;
        return bayerOn(x, y, (1 - depth / reach) * strength) ? "d" : "k";
      })
      .join(""),
  );
}

/**
 * The pixels with a share `amount` (0–1) of their cells taken away in
 * Bayer order. Each larger amount removes a superset of the cells.
 */
export const dissolve = (pixels: Pixels, amount: number): Pixels =>
  pixels.map((row, y) =>
    [...row].map((cell, x) => (bayerOn(x, y, amount) ? "." : cell)).join(""),
  );

/** The steps a particle dissolves through, from whole to nearly gone. */
export const DISSOLVE_STAGES: readonly number[] = [0, 0.3, 0.55, 0.8];
