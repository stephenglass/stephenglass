/**
 * Tony and friends, drawn as pixel rows (see src/lib/pixels.ts). Keys:
 * k body, w eye, o outline (added by `withOutline`), f/F fish,
 * g/G golden fish, s/S starfish, z sleep mark.
 *
 * Pure data: shared by build-time SVGs, the game and the brand-asset script.
 */
import type { Pixels } from "./pixels";

/** Fills for every key. Inline SVGs override `k` and `o` through CSS vars. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: "#16131a",
  w: "#ece8e1",
  o: "transparent",
  f: "#f68a3c",
  F: "#d8612a",
  g: "#ffd23f",
  G: "#e9a91a",
  s: "#ee7f67",
  S: "#c4553f",
  z: "#ffffff",
};

/*
 * Tony, sitting (16×15): a plain black cat, after the original site's.
 * Pointed ears, a modest head on a taller body, two light eyes, and a tail
 * curled round his side. Only the eyes change between frames.
 */
const OPEN = "..kkwkkwkk......";
const SHUT = "..kkkkkkkk......";

/** Tony with the given two head rows at eye level. */
const tony = (upper: string, lower: string): Pixels => [
  "..k......k......",
  "..kk....kk......",
  "..kkkkkkkk......",
  upper,
  lower,
  "..kkkkkkkk......",
  "...kkkkkk.......",
  "..kkkkkkkk......",
  ".kkkkkkkkkk.....",
  ".kkkkkkkkkk....k",
  ".kkkkkkkkkk....k",
  ".kkkkkkkkkk...kk",
  ".kkkkkkkkkk..kk.",
  ".kkkkkkkkkkkkk..",
  ".kkkkkkkkkk.....",
];

export const TONY_SIT: Pixels = tony(SHUT, OPEN);

/** Eyes shut: blinking, napping, or content while being petted. */
export const TONY_BLINK: Pixels = tony(SHUT, SHUT);
export const TONY_HAPPY: Pixels = TONY_BLINK;
export const TONY_SLEEP: Pixels = TONY_BLINK;

/** Wide-eyed: startled by a starfish. */
export const TONY_OUCH: Pixels = tony(OPEN, OPEN);

/* The aquarium. */

/** A goldfish facing right. */
export const FISH: Pixels = [
  ".....FFF...",
  "F...ffffff.",
  "FF.ffffffkf",
  "FF.ffffffff",
  "F...ffffff.",
  ".....FF....",
];

/** The rare golden fish: same shape, worth more. */
export const GOLDFISH: Pixels = FISH.map((row) =>
  row.replaceAll("f", "g").replaceAll("F", "G"),
);

/** A starfish: sinks, and startles Tony if he catches it. */
export const STARFISH: Pixels = [
  "....s....",
  "...sss...",
  "...sss...",
  "sssssssss",
  ".sssSsss.",
  "..sssss..",
  "..ss.ss..",
  ".ss...ss.",
  ".s.....s.",
];

export const ZZ: Pixels = ["zzzz", "..z.", ".z..", "zzzz"];

/** Mirror a sprite left to right. */
export const flip = (pixels: Pixels): Pixels =>
  pixels.map((row) => [...row].reverse().join(""));

/**
 * Add a 1-cell `o` outline around the silhouette, so a black cat still reads
 * on a dark surface (the outline is transparent in the light theme). Grows
 * the sprite by one cell on each side.
 */
export function withOutline(pixels: Pixels): Pixels {
  const height = pixels.length + 2;
  const width = Math.max(...pixels.map((row) => row.length)) + 2;
  const at = (x: number, y: number): string => pixels[y - 1]?.[x - 1] ?? ".";
  const rows: string[] = [];
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const cell = at(x, y);
      if (cell !== ".") {
        row += cell;
        continue;
      }
      const touches =
        at(x - 1, y) !== "." ||
        at(x + 1, y) !== "." ||
        at(x, y - 1) !== "." ||
        at(x, y + 1) !== ".";
      row += touches ? "o" : ".";
    }
    rows.push(row);
  }
  return rows;
}
