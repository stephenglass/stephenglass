/** Sprites drawn once to 1:1 canvases, then blitted with drawImage. */
import { sizeOf, toRuns, type Pixels } from "@/lib/pixels";
import { PALETTE } from "@/lib/sprites";

const cache = new Map<Pixels, HTMLCanvasElement>();

export function spriteCanvas(pixels: Pixels): HTMLCanvasElement {
  let canvas = cache.get(pixels);
  if (canvas) return canvas;
  const { width, height } = sizeOf(pixels);
  canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) {
    for (const run of toRuns(pixels)) {
      context.fillStyle = PALETTE[run.key] ?? "#000";
      context.fillRect(run.x, run.y, run.width, 1);
    }
  }
  cache.set(pixels, canvas);
  return canvas;
}
