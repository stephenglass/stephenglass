/**
 * Plays the laser dot along Tony's line now and then (see LaserDot.astro and
 * src/lib/laser.ts), and tells Tony which way to look with a `tony:gaze`
 * event. Tony's markup gives his measurements in cells: `data-paws-col` and
 * `data-eye-col`.
 */
import {
  gazeFor,
  nextMove,
  snap,
  tremor,
  visitPlan,
  type Gaze,
  type Move,
} from "@/lib/laser";
import { reducedMotion, tonyCell, whileOnScreen } from "@/scripts/motion";

/** The closest the dot comes to Tony's paws, in cells. */
const CLEARANCE = 2;
/** Near his paws he looks ahead, down at it; farther off, left. */
const DEAD_ZONE = 20;
const HYSTERESIS = 1.5;
const FIRST_VISIT_MS = 3000;
/** Matches the dot's CSS opacity transition. */
const FADE_MS = 300;
const TREMOR_MS = 120;

const easeOut = (t: number): number => 1 - (1 - t) ** 4;
const easeInOut = (t: number): number => (1 - Math.cos(Math.PI * t)) / 2;

function initLaser(dot: HTMLElement): void {
  const line = dot.parentElement;
  const tony = line?.querySelector<HTMLElement>("[data-pet-root]");
  const count = tony?.querySelector<HTMLElement>("[data-pet-count]");
  if (!line || !tony) return;

  const size = Number(dot.dataset.cols);
  const pawsCol = Number(tony.dataset.pawsCol);
  const eyeCol = Number(tony.dataset.eyeCol);

  let cell = 3;
  let max = 0;
  let eyeX = 0;

  let active = false;
  let visiting = false;
  let timer = 0;
  let frame = 0;
  let visitEnd = 0;
  let gap = 0;

  let x = 0;
  let placed = Number.NaN;
  let move: Move | null = null;
  let moveFrom = 0;
  let moveStart = 0;
  let wobble = 0;
  let nextWobble = 0;
  let gaze: Gaze = "ahead";

  const measure = (): void => {
    cell = tonyCell(line);
    const lineLeft = line.getBoundingClientRect().left;
    const tonyX = tony.getBoundingClientRect().left - lineLeft;
    // Stop short of his paws, or of his pet count once it shows.
    let end = tonyX + pawsCol * cell;
    if (count && !count.hidden)
      end = Math.min(end, count.getBoundingClientRect().left - lineLeft);
    max = Math.max(0, end - (CLEARANCE + size) * cell);
    eyeX = tonyX + eyeCol * cell;
  };

  const track = (from: number) => ({ from, min: 0, max, cell });

  const place = (px: number): void => {
    if (px === placed) return;
    placed = px;
    dot.style.translate = `${px}px -50%`;
  };

  const look = (): void => {
    const next = gazeFor(
      visiting ? x + (size * cell) / 2 : null,
      eyeX,
      DEAD_ZONE * cell,
      gaze,
      HYSTERESIS * cell,
    );
    if (next === gaze) return;
    gaze = next;
    tony.dispatchEvent(new CustomEvent("tony:gaze", { detail: gaze }));
  };

  const schedule = (delay: number): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(startVisit, delay);
  };

  const endVisit = (): void => {
    cancelAnimationFrame(frame);
    visiting = false;
    move = null;
    delete dot.dataset.on;
    dot.dataset.animating = "false";
    look();
  };

  const tick = (now: number): void => {
    if (!move) return;
    const t = (now - moveStart) / move.duration;
    if (t < 0) {
      // Still fading in.
    } else if (t < 1) {
      const eased = move.creep ? easeInOut(t) : easeOut(t);
      x = snap(moveFrom + (move.to - moveFrom) * eased, track(x));
    } else if (now < moveStart + move.duration + move.hold) {
      if (now >= nextWobble) {
        wobble = tremor(Math.random) * cell;
        nextWobble = now + TREMOR_MS;
      }
      x = snap(move.to + wobble, track(x));
    } else if (now >= visitEnd) {
      endVisit();
      schedule(gap);
      return;
    } else {
      moveFrom = x;
      move = nextMove(Math.random, track(x));
      moveStart = now;
      wobble = 0;
    }
    place(x);
    look();
    frame = requestAnimationFrame(tick);
  };

  function startVisit(): void {
    timer = 0;
    if (!active) return;
    measure();
    const plan = visitPlan(Math.random);
    const now = performance.now();
    visiting = true;
    visitEnd = now + plan.length;
    gap = plan.gap;
    x = snap(Math.random() * max, track(0));
    place(x);
    moveFrom = x;
    move = nextMove(Math.random, track(x));
    moveStart = now + FADE_MS;
    dot.dataset.on = "";
    dot.dataset.animating = "true";
    frame = requestAnimationFrame(tick);
  }

  dot.hidden = false;
  const resize = new ResizeObserver(measure);
  resize.observe(line);
  if (count) resize.observe(count);

  whileOnScreen(line, (onScreen) => {
    active = onScreen;
    if (active) {
      if (!visiting && !timer) schedule(FIRST_VISIT_MS);
    } else {
      window.clearTimeout(timer);
      timer = 0;
      if (visiting) endVisit();
    }
  });
}

if (!reducedMotion)
  document.querySelectorAll<HTMLElement>("[data-laser]").forEach(initLaser);
