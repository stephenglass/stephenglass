/**
 * Tony, drawn as pixel rows (see src/lib/pixels.ts). Keys: k body, w eye,
 * d dithered light (added by `withLight`), s seam, z sleep mark.
 *
 * Pure data: shared by build-time SVGs, the favicon and the brand-asset script.
 */
import type { Pixels } from "./pixels";

/** Fills for every key. Inline SVGs override `k` and `z` through CSS. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: "#16131a",
  w: "#ece8e1",
  d: "#3d3843",
  s: "#3d3843",
  z: "#16131a",
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

/*
 * Tony, larger (28×28): the same cat with room for a real silhouette.
 * Softly rounded ears and head, level 2×2 eyes, a neck, a haunch rising to the
 * right, front paws parted by a seam, and a long tail curling up beside him.
 * On the page he is lit with `withLight` (see TONY_LIT_*).
 */
const HI_OPEN = [
  ".kkkkwwkkkwwkkkk............",
  ".kkkkwwkkkwwkkkk............",
];
const HI_SHUT = [
  ".kkkkkkkkkkkkkkk............",
  ".kkkkkkkkkkkkkkk............",
];

const tonyHi = ([upper, lower]: readonly string[]): Pixels => [
  "...kk.......kk..............",
  "...kkk.....kkk..............",
  "..kkkkk...kkkkk.............",
  "..kkkkkkkkkkkkk.............",
  "..kkkkkkkkkkkkk.............",
  ".kkkkkkkkkkkkkkk............",
  upper ?? "",
  lower ?? "",
  ".kkkkkkkkkkkkkkk............",
  "..kkkkkkkkkkkkk.............",
  "...kkkkkkkkkkk..............",
  ".....kkkkkkkk...............",
  "....kkkkkkkkkkk.............",
  "....kkkkkkkkkkkk............",
  "...kkkkkkkkkkkkkk...........",
  "...kkkkkkkkkkkkkkk..........",
  "...kkkkkkkkkkkkkkkk.....kk..",
  "...kkkkkkkkkkkkkkkk......kkk",
  "..kkkkkkkkkkkkkkkkkk......kk",
  "..kkkkkkkkkkkkkkkkkk......kk",
  "..kkkkkkkkkkkkkkkkkkk.....kk",
  "..kkkkkkkkkkkkkkkkkkk.....kk",
  "..kkkkkkkkkkkkkkkkkkk....kk.",
  "..kkkkskkkkkkkkkkkkkk...kkk.",
  "..kkkkskkkkkkkkkkkkkk..kkk..",
  "..kkkkskkkkkkkkkkkkkk.kkk...",
  ".kkkkkkkkkkkkkkkkkkkkkkk....",
  ".kkkkkkkkkkkkkkkkkkkkkk.....",
];

export const TONY_HI_SIT: Pixels = tonyHi(HI_OPEN);
export const TONY_HI_BLINK: Pixels = tonyHi(HI_SHUT);

/** 4×4 Bayer matrix, values 0–15. */
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * Light Tony from the top right in 1-bit: body cells within `reach` of an
 * edge facing right (or up, on his ears and crown) fade toward `d`, ordered-dithered
 * like the Tonelabs row. Thin strokes like the tail stay mostly dark. Same
 * size; eyes and seams untouched.
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
          const head = y < 4 && empty(x, y - i);
          if (empty(x + i, y - i) || empty(x + i, y) || head) {
            depth = i - 1;
            break;
          }
        }
        if (depth > 0 && empty(x - 1, y) && empty(x + 1, y + 1)) depth = reach;
        const light = (1 - depth / reach) * strength;
        return light * 16 > (BAYER_4[(y & 3) * 4 + (x & 3)] ?? 0) + 0.5
          ? "d"
          : "k";
      })
      .join(""),
  );
}

export const ZZ: Pixels = ["zzzz", "..z.", ".z..", "zzzz"];

/** Tony as the page shows him: lit from the top right in dithered grey. */
export const TONY_LIT_SIT: Pixels = withLight(TONY_HI_SIT, 4, 0.7);
export const TONY_LIT_BLINK: Pixels = withLight(TONY_HI_BLINK, 4, 0.7);
