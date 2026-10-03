/**
 * Draws tonelabs' dithered beams into each `canvas[data-dither]` (see
 * TonelabsDither.astro). Each canvas pixel covers `CELL_PX` CSS pixels. The
 * beams drift very slowly while on screen, and hold one still frame under
 * reduced motion.
 */
import { beamsIntensity, renderDither, type Rgba } from "@/lib/dither";
import { BONE } from "@/lib/palette";
import { reducedMotion, whileOnScreen } from "@/scripts/motion";

const CELL_PX = 3;
/** The drift is slow enough that 15 frames a second looks continuous. */
const FRAME_MS = 1000 / 15;
/** The beams resolve from nothing over this long after load. */
const RESOLVE_MS = 1200;
/** Slower than tonelabs' hero: a drift you notice only when you look. */
const TIME_SCALE = 0.5;
/** Frame time used under reduced motion. */
const STILL_T = 14;
/** Bone at low alpha, as on tonelabs.io. */
const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) =>
  parseInt(BONE.slice(i, i + 2), 16),
);
const COLOR: Rgba = [r, g, b, 96];

function initDither(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (!context) return;

  let image: ImageData | null = null;
  let active = false;
  let running = false;
  let lastFrame = 0;
  const startedAt = performance.now();

  const draw = (now: number): void => {
    if (!image) return;
    const t = reducedMotion ? STILL_T : (now / 1000) * TIME_SCALE;
    const density = reducedMotion
      ? 1
      : Math.min(1, (now - startedAt) / RESOLVE_MS);
    renderDither(
      image.data,
      image.width,
      image.height,
      beamsIntensity,
      t,
      COLOR,
      density * (2 - density),
    );
    context.putImageData(image, 0, 0);
  };

  const resize = (): void => {
    const width = Math.max(1, Math.ceil(canvas.clientWidth / CELL_PX));
    const height = Math.max(1, Math.ceil(canvas.clientHeight / CELL_PX));
    if (image && image.width === width && image.height === height) return;
    canvas.width = width;
    canvas.height = height;
    image = context.createImageData(width, height);
    draw(performance.now());
  };

  const loop = (now: number): void => {
    if (!active) {
      running = false;
      return;
    }
    if (now - lastFrame >= FRAME_MS) {
      lastFrame = now;
      draw(now);
    }
    requestAnimationFrame(loop);
  };

  new ResizeObserver(resize).observe(canvas);
  resize();

  if (reducedMotion) return;

  whileOnScreen(canvas, (onScreen) => {
    active = onScreen;
    canvas.dataset.animating = String(active);
    if (active && !running) {
      running = true;
      requestAnimationFrame(loop);
    }
  });
}

document
  .querySelectorAll<HTMLCanvasElement>("canvas[data-dither]")
  .forEach(initDither);
