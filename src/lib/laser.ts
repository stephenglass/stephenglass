/**
 * The laser pointer that now and then plays along Tony's line: where the dot
 * goes next, how long a visit lasts, and which way Tony looks. Positions are
 * in CSS pixels along the line and land on whole sprite cells. The dot stays
 * to Tony's left, so he only ever looks left or ahead.
 *
 * Pure: `random` is passed in so tests can seed it.
 */
export type Random = () => number;
export type Gaze = "left" | "ahead";

export interface Move {
  to: number;
  /** Travel time, ms. */
  duration: number;
  /** Rest at `to` afterwards, ms. */
  hold: number;
  /** A slow, even creep rather than a dart. */
  creep: boolean;
}

export interface Track {
  from: number;
  min: number;
  max: number;
  cell: number;
}

const between = (random: Random, low: number, high: number): number =>
  low + random() * (high - low);

/** The nearest whole cell to `x`, kept on the line. */
export function snap(x: number, { min, max, cell }: Track): number {
  const last = min + Math.floor((max - min) / cell) * cell;
  const cells = Math.round((x - min) / cell);
  return Math.min(last, Math.max(min, min + cells * cell));
}

/**
 * Where the dot goes next, like a hand holding the pointer: mostly darts
 * across the line, sometimes a twitch nearby, sometimes a slow creep.
 */
export function nextMove(random: Random, track: Track): Move {
  const { from, min, max, cell } = track;
  const kind = random();

  if (kind < 0.15) {
    const step = Math.round(between(random, 2, 6)) * cell;
    const to = snap(from + (random() < 0.5 ? -step : step), track);
    return {
      to,
      duration: between(random, 100, 180),
      hold: between(random, 150, 400),
      creep: false,
    };
  }

  if (kind < 0.3) {
    const reach = Math.min(max - min, between(random, 12, 30) * cell);
    const to = snap(from + (random() < 0.5 ? -reach : reach), track);
    return {
      to,
      duration: between(random, 1200, 2200),
      hold: between(random, 300, 800),
      creep: true,
    };
  }

  const to = snap(between(random, min, max), track);
  const distance = Math.abs(to - from) / Math.max(1, max - min);
  return {
    to,
    duration: 180 + distance * 420,
    hold: between(random, 300, 1500),
    creep: false,
  };
}

/** A hand's tremor while the dot rests: usually still, sometimes a cell. */
export function tremor(random: Random): -1 | 0 | 1 {
  const r = random();
  return r < 0.15 ? -1 : r > 0.85 ? 1 : 0;
}

/** How long a visit lasts and how long until the next one, ms. */
export function visitPlan(random: Random): { length: number; gap: number } {
  return {
    length: between(random, 10_000, 15_000),
    gap: between(random, 30_000, 60_000),
  };
}

/**
 * Which way Tony looks at a dot at `dotX` from eyes at `eyeX`. Within
 * `deadZone` he looks ahead, down at it by his paws. `hysteresis` keeps his
 * current gaze until the dot is clearly past the edge, so a tremor can't
 * flicker it.
 */
export function gazeFor(
  dotX: number | null,
  eyeX: number,
  deadZone: number,
  current: Gaze = "ahead",
  hysteresis = 0,
): Gaze {
  if (dotX === null) return "ahead";
  const edge =
    current === "left" ? deadZone - hysteresis : deadZone + hysteresis;
  return eyeX - dotX > edge ? "left" : "ahead";
}
