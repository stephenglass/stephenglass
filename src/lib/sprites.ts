/**
 * Tony, drawn as pixel rows (see src/lib/pixels.ts). Keys: k body, w eye,
 * d dithered light (added by `withLight`), s seam, z sleep mark; r and q
 * are the laser dot's core and halo. The particles use h and j (rose
 * pink), b (slate blue) and c (pale blue).
 *
 * Pure data: shared by build-time SVGs and the brand-asset script.
 */
import type { Pixels } from "./pixels";

/** Fills for every key. Inline SVGs override `k` and `z` through CSS. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: "#16131a",
  w: "#ece8e1",
  d: "#3d3843",
  s: "#3d3843",
  z: "#16131a",
  r: "#e5281e",
  q: "#f29a92",
  h: "#e0577a",
  j: "#f4b3c2",
  b: "#4f6d8f",
  c: "#a8bdd4",
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
/* Eyes one pixel left: watching the laser dot. */
const HI_LEFT = [
  ".kkkwwkkkwwkkkkk............",
  ".kkkwwkkkwwkkkkk............",
];
const HI_SHUT = [
  ".kkkkkkkkkkkkkkk............",
  ".kkkkkkkkkkkkkkk............",
];
/* Content: eyes shut in a ^ while he is petted. */
const HI_HAPPY = [
  ".kkkkwwkkkwwkkkk............",
  ".kkkwkkwkwkkwkkk............",
];

/* Ears up, or the left one flicked flat for a moment. */
const EARS_UP = [
  "...kk.......kk..............",
  "...kkk.....kkk..............",
  "..kkkkk...kkkkk.............",
];
const EARS_FLICK = [
  "............kk..............",
  "...........kkk..............",
  ".kkkkkk...kkkkk.............",
];

const tonyHi = (
  [upper, lower]: readonly string[],
  ears: readonly string[] = EARS_UP,
): Pixels => [
  ...ears,
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
export const TONY_HI_LOOK_LEFT: Pixels = tonyHi(HI_LEFT);
export const TONY_HI_HAPPY: Pixels = tonyHi(HI_HAPPY);
export const TONY_HI_EAR_FLICK: Pixels = tonyHi(HI_OPEN, EARS_FLICK);

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

/**
 * The laser pointer's dot (5×5): a red core with a sparse 1-bit halo, the
 * glow drawn the same way as Tony's light.
 */
export const LASER: Pixels = [".q.q.", "qrrrq", ".rrr.", "qrrrq", ".q.q."];

export const ZZ: Pixels = ["zzzz", "..z.", ".z..", "zzzz"];

/** The pixels with some keys swapped for others. */
const recolor = (
  pixels: Pixels,
  keys: Readonly<Record<string, string>>,
): Pixels =>
  pixels.map((row) => [...row].map((cell) => keys[cell] ?? cell).join(""));

/*
 * What rises from Tony when he is petted, drawn on his grid and lit like him
 * from the top right: a rose-pink heart, and a slate-blue fish every 20th
 * pet.
 */
export const HEART: Pixels = recolor(
  withLight(
    [".kk.kk.", "kkkkkkk", "kkkkkkk", ".kkkkk.", "..kkk..", "...k..."],
    2,
    0.8,
  ),
  { k: "h", d: "j" },
);

export const FISH: Pixels = recolor(
  withLight(
    ["..kkk...k", ".kkkkk.kk", "kwkkkkkkk", ".kkkkk.kk", "..kkk...k"],
    2,
    0.7,
  ),
  { k: "b", d: "c", w: "k" },
);

/**
 * The pixels with a share `amount` (0–1) of their cells taken away in
 * Bayer order, so a sprite dissolves the way the page's light is drawn.
 * Each larger amount removes a superset of the cells.
 */
export function dissolve(pixels: Pixels, amount: number): Pixels {
  return pixels.map((row, y) =>
    [...row]
      .map((cell, x) =>
        amount * 16 > (BAYER_4[(y & 3) * 4 + (x & 3)] ?? 0) + 0.5 ? "." : cell,
      )
      .join(""),
  );
}

/** The steps a particle dissolves through, from whole to nearly gone. */
export const DISSOLVE_STAGES: readonly number[] = [0, 0.3, 0.55, 0.8];

/** Tony as the page shows him: lit from the top right in dithered grey. */
export const TONY_LIT_SIT: Pixels = withLight(TONY_HI_SIT, 4, 0.7);
export const TONY_LIT_BLINK: Pixels = withLight(TONY_HI_BLINK, 4, 0.7);
export const TONY_LIT_LOOK_LEFT: Pixels = withLight(TONY_HI_LOOK_LEFT, 4, 0.7);
export const TONY_LIT_HAPPY: Pixels = withLight(TONY_HI_HAPPY, 4, 0.7);
export const TONY_LIT_EAR_FLICK: Pixels = withLight(TONY_HI_EAR_FLICK, 4, 0.7);
