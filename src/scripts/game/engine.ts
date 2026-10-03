/**
 * Fish Catch: Tony pads along the bottom of an aquarium catching sinking
 * fish. Golden fish are worth more; starfish cost a heart. Pure state and
 * rules, no DOM, stepped at a fixed rate. Units are logical pixels (the
 * canvas scales them by whole device pixels) and seconds.
 */

/** Logical tank height and the top of the sand. */
export const H = 100;
export const FLOOR = 90;

const TONY_W = 16;
const TONY_H = 15;

const KEY_SPEED = 150;
/** Pointer steering: ease toward the target, snappily, with a speed cap. */
const POINTER_EASE = 0.045;
const POINTER_MAX_SPEED = 900;
const LIVES = 3;
const RETRY_LOCK = 0.5;
/** Seconds a landed item lingers on the sand before it goes. */
const LANDED_FOR = 0.8;

export type Phase = "idle" | "running" | "paused" | "over";
export type ItemKind = "fish" | "gold" | "starfish";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Item extends Box {
  kind: ItemKind;
  /** Centre line the item wobbles around as it sinks. */
  baseX: number;
  vy: number;
  wobble: number;
  /** Faces left (sprites are drawn facing right). */
  flip: boolean;
  /** Seconds on the sand; null while still sinking. */
  landed: number | null;
}

export type GameEvent =
  | { type: "catch"; kind: "fish" | "gold"; x: number; y: number }
  | { type: "ouch"; x: number; y: number }
  | { type: "over"; score: number };

export interface State {
  phase: Phase;
  /** Logical tank width; set by the view when the canvas resizes. */
  width: number;
  /** Seconds of the current round. */
  time: number;
  score: number;
  lives: number;
  tony: Box & { stride: number };
  left: boolean;
  right: boolean;
  /** Where a pointer wants Tony (logical x of his centre), if anywhere. */
  pointerX: number | null;
  items: Item[];
  untilSpawn: number;
  happyFor: number;
  ouchFor: number;
  overFor: number;
  /** Things the view reacts to; drained by the caller each frame. */
  events: GameEvent[];
  random: () => number;
}

const SIZES: Record<ItemKind, { w: number; h: number }> = {
  fish: { w: 11, h: 6 },
  gold: { w: 11, h: 6 },
  starfish: { w: 9, h: 9 },
};

const POINTS: Record<"fish" | "gold", number> = { fish: 1, gold: 5 };

export function createState(width: number, random = Math.random): State {
  return {
    phase: "idle",
    width,
    time: 0,
    score: 0,
    lives: LIVES,
    tony: {
      x: Math.round(width / 2 - TONY_W / 2),
      y: FLOOR - TONY_H,
      w: TONY_W,
      h: TONY_H,
      stride: 0,
    },
    left: false,
    right: false,
    pointerX: null,
    items: [],
    untilSpawn: 0.6,
    happyFor: 0,
    ouchFor: 0,
    overFor: 0,
    events: [],
    random,
  };
}

function start(s: State): void {
  const fresh = createState(s.width, s.random);
  fresh.tony.x = s.tony.x;
  Object.assign(s, fresh, {
    phase: "running",
    left: s.left,
    right: s.right,
    pointerX: s.pointerX,
  });
}

/** Space, Enter or a tap: start, retry or resume. */
export function press(s: State): void {
  if (s.phase === "idle") start(s);
  else if (s.phase === "over" && s.overFor >= RETRY_LOCK) start(s);
  else if (s.phase === "paused") s.phase = "running";
}

export function steer(s: State, left: boolean, right: boolean): void {
  s.left = left;
  s.right = right;
  if (left || right) s.pointerX = null;
}

export function point(s: State, x: number | null): void {
  s.pointerX = x;
}

export function pause(s: State): void {
  if (s.phase === "running") s.phase = "paused";
}

export function togglePause(s: State): void {
  if (s.phase === "running") s.phase = "paused";
  else if (s.phase === "paused") s.phase = "running";
}

/** The part of Tony that catches: head and shoulders, a little forgiving. */
export const catchBox = (tony: Box): Box => ({
  x: tony.x,
  y: tony.y + 1,
  w: tony.w - 4,
  h: tony.h - 6,
});

export const overlaps = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function spawn(s: State): void {
  const starfishOdds = s.time < 5 ? 0 : Math.min(0.42, 0.22 + s.time * 0.004);
  const kind: ItemKind =
    s.random() < starfishOdds
      ? "starfish"
      : s.random() < 0.08
        ? "gold"
        : "fish";
  const { w, h } = SIZES[kind];
  const baseX = 4 + s.random() * Math.max(1, s.width - w - 8);
  const sink = (24 + Math.min(46, s.time * 0.8)) * (0.85 + s.random() * 0.3);
  s.items.push({
    kind,
    x: baseX,
    y: -h,
    w,
    h,
    baseX,
    vy: kind === "starfish" ? sink * 1.15 : sink,
    wobble: s.random() * Math.PI * 2,
    flip: s.random() < 0.5,
    landed: null,
  });
}

/** Advance one fixed step. */
export function update(s: State, dt: number): void {
  if (s.phase === "over") {
    s.overFor += dt;
    return;
  }
  if (s.phase !== "running") return;

  s.time += dt;
  s.happyFor = Math.max(0, s.happyFor - dt);
  s.ouchFor = Math.max(0, s.ouchFor - dt);

  // Tony walks toward the pointer, or where the keys say.
  const tony = s.tony;
  const before = tony.x;
  if (s.pointerX !== null) {
    const dx = s.pointerX - (tony.x + tony.w / 2);
    const eased = dx * (1 - Math.exp(-dt / POINTER_EASE));
    const cap = POINTER_MAX_SPEED * dt;
    tony.x += Math.max(-cap, Math.min(cap, eased));
  } else {
    tony.x += (Number(s.right) - Number(s.left)) * KEY_SPEED * dt;
  }
  tony.x = Math.max(2, Math.min(s.width - tony.w - 2, tony.x));
  tony.stride += Math.abs(tony.x - before);

  s.untilSpawn -= dt;
  if (s.untilSpawn <= 0) {
    spawn(s);
    s.untilSpawn =
      Math.max(0.42, 1.15 - s.time * 0.012) * (0.7 + s.random() * 0.6);
  }

  const zone = catchBox(tony);
  const kept: Item[] = [];
  for (const item of s.items) {
    if (item.landed !== null) {
      item.landed += dt;
      if (item.landed < LANDED_FOR) kept.push(item);
      continue;
    }

    item.y += item.vy * dt;
    const sway = item.kind === "starfish" ? 1 : 3;
    item.x = item.baseX + Math.sin(s.time * 2.2 + item.wobble) * sway;

    if (overlaps(zone, item)) {
      if (item.kind === "starfish") {
        s.lives -= 1;
        s.ouchFor = 0.6;
        s.events.push({ type: "ouch", x: item.x, y: item.y });
        if (s.lives <= 0) {
          s.phase = "over";
          s.overFor = 0;
          s.events.push({ type: "over", score: s.score });
          s.items = kept;
          return;
        }
      } else {
        s.score += POINTS[item.kind];
        s.happyFor = 0.45;
        s.events.push({ type: "catch", kind: item.kind, x: item.x, y: item.y });
      }
      continue;
    }

    if (item.y + item.h >= FLOOR) {
      item.y = FLOOR - item.h;
      item.landed = 0;
    }
    kept.push(item);
  }
  s.items = kept;
}
