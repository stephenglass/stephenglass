/**
 * Pixel art as rows of characters: one character per cell, "." is empty.
 * Pure helpers shared by build-time SVG components, the game's sprite cache
 * and the brand-asset script, so keep this file free of DOM access and of
 * non-erasable TypeScript syntax.
 */
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
