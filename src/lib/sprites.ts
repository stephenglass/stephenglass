/**
 * The page's pixel art (see src/lib/pixels.ts). Keys: k body, w eye, d
 * dithered light (added by `withLight`), s seam, z sleep mark; r and q are
 * the laser dot's core and halo; h and j (rose pink) and b and c (slate
 * blue) colour Tony's particles.
 */
import { INK } from "./palette.ts";
import { recolor, sizeOf, withLight, type Pixels } from "./pixels.ts";

/** Fills for every key. Inline SVGs draw `z` in the text colour instead. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: INK,
  w: "#ece8e1",
  d: "#3d3843",
  s: "#3d3843",
  z: INK,
  r: "#e5281e",
  q: "#f29a92",
  h: "#e0577a",
  j: "#f4b3c2",
  b: "#4f6d8f",
  c: "#a8bdd4",
};

/** Small Tony (16×15), asleep on the 404 page. */
export const TONY_SLEEP: Pixels = [
  "..k......k......",
  "..kk....kk......",
  "..kkkkkkkk......",
  "..kkkkkkkk......",
  "..kkkkkkkk......",
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

export const ZZ: Pixels = ["zzzz", "..z.", ".z..", "zzzz"];

/*
 * Tony (28×28), sitting on the links' rule: softly rounded ears and head,
 * level 2×2 eyes, a haunch rising to the right, front paws parted by a seam,
 * and a long tail curling up beside him. Frames differ only in the eye rows
 * and the ears.
 */
const EYES = {
  open: [".kkkkwwkkkwwkkkk............", ".kkkkwwkkkwwkkkk............"],
  /** One pixel left: watching the laser dot. */
  left: [".kkkwwkkkwwkkkkk............", ".kkkwwkkkwwkkkkk............"],
  shut: [".kkkkkkkkkkkkkkk............", ".kkkkkkkkkkkkkkk............"],
  /** Content: shut in a ^ while he is petted. */
  happy: [".kkkkwwkkkwwkkkk............", ".kkkwkkwkwkkwkkk............"],
} as const;

const EARS = {
  up: [
    "...kk.......kk..............",
    "...kkk.....kkk..............",
    "..kkkkk...kkkkk.............",
  ],
  /** The left ear flicked flat for a moment. */
  flick: [
    "............kk..............",
    "...........kkk..............",
    ".kkkkkk...kkkkk.............",
  ],
} as const;

const tony = (
  [upper, lower]: readonly string[],
  ears: readonly string[] = EARS.up,
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

/** Tony lit from the top right in dithered grey, as the page shows him. */
const lit = (pixels: Pixels): Pixels => withLight(pixels, 4, 0.7);

export const TONY_FRAMES = {
  sit: lit(tony(EYES.open)),
  "look-left": lit(tony(EYES.left)),
  blink: lit(tony(EYES.shut)),
  happy: lit(tony(EYES.happy)),
  "ear-flick": lit(tony(EYES.open, EARS.flick)),
} as const satisfies Record<string, Pixels>;

export type TonyFrame = keyof typeof TONY_FRAMES;

/** Tony's measurements in cells, for placing things around him. */
export const TONY_COLS = sizeOf(TONY_FRAMES.sit).width;
/** Where his ink meets the rule: the left edge of his paws. */
export const TONY_PAWS_COL = TONY_FRAMES.sit.at(-1)?.search(/[^.]/) ?? 0;
/** The middle of his eyes. */
export const TONY_EYE_COL =
  (EYES.open[0].indexOf("w") + EYES.open[0].lastIndexOf("w") + 1) / 2;

/**
 * The laser pointer's dot (5×5): a red core with a sparse 1-bit halo, the
 * glow drawn the same way as Tony's light.
 */
export const LASER: Pixels = [".q.q.", "qrrrq", ".rrr.", "qrrrq", ".q.q."];

/*
 * What rises from Tony when he is petted, drawn on his grid and lit like
 * him: a rose-pink heart, and now and then a slate-blue fish.
 */
export const PARTICLES = {
  heart: recolor(
    withLight(
      [".kk.kk.", "kkkkkkk", "kkkkkkk", ".kkkkk.", "..kkk..", "...k..."],
      2,
      0.8,
    ),
    { k: "h", d: "j" },
  ),
  fish: recolor(
    withLight(
      ["..kkk...k", ".kkkkk.kk", "kwkkkkkkk", ".kkkkk.kk", "..kkk...k"],
      2,
      0.7,
    ),
    { k: "b", d: "c", w: "k" },
  ),
} as const satisfies Record<string, Pixels>;

export type ParticleName = keyof typeof PARTICLES;
