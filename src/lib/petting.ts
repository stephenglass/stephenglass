import type { ParticleName } from "./sprites.ts";

/** What Tony does on the `pets`-th pet. Pure, so the schedule is testable. */
export interface Reaction {
  particle: ParticleName;
  /** Cells to hop; 0 while he flicks an ear. */
  hop: number;
  earFlick: boolean;
  meow: boolean;
  /** A small flight of hearts as well. */
  flight: boolean;
}

export function reactionTo(pets: number): Reaction {
  const fish = pets % 20 === 0;
  const earFlick = pets % 30 === 0;
  return {
    particle: fish ? "fish" : "heart",
    hop: earFlick ? 0 : fish ? 3 : 1,
    earFlick,
    meow: pets % 15 === 0,
    flight: pets % 50 === 0,
  };
}
