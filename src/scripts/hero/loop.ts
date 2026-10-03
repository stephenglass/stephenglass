/**
 * Shared lifecycle for the hero's ambient backgrounds: a capped frame rate,
 * paused when offscreen or the tab is hidden, and a single fixed frame under
 * `prefers-reduced-motion`. Never reacts to the pointer.
 */
export interface Ambient {
  /** Fit buffers to the element's current size. */
  resize(): void;
  /** Draw the frame for `time` seconds since start. */
  draw(time: number): void;
}

interface Options {
  fps: number;
  /** The moment shown when motion is reduced. */
  stillTime: number;
}

export function runAmbient(
  element: HTMLElement,
  ambient: Ambient,
  { fps, stillTime }: Options,
): void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frameMs = 1000 / fps;
  let visible = false;
  let running = false;
  let lastFrame = 0;
  let startedAt = performance.now();

  const drawNow = (now: number): void => {
    ambient.draw(reducedMotion.matches ? stillTime : (now - startedAt) / 1000);
  };

  const loop = (now: number): void => {
    if (!visible || document.hidden || reducedMotion.matches) {
      running = false;
      element.dataset.animating = "false";
      return;
    }
    if (now - lastFrame >= frameMs) {
      lastFrame = now;
      drawNow(now);
    }
    requestAnimationFrame(loop);
  };

  const start = (): void => {
    if (running || !visible || document.hidden || reducedMotion.matches) {
      return;
    }
    running = true;
    element.dataset.animating = "true";
    requestAnimationFrame(loop);
  };

  new ResizeObserver(() => {
    ambient.resize();
    drawNow(performance.now());
  }).observe(element);
  ambient.resize();
  drawNow(performance.now());
  element.dataset.ready = "";

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    start();
  }).observe(element);
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", () => {
    startedAt = performance.now();
    drawNow(performance.now());
    start();
  });
}
