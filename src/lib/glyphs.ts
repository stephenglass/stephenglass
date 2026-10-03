/**
 * 1-bit glyphs on an 8×8 grid, after tonelabs' PixelGlyph: "#" is lit, "."
 * is empty. Render at a multiple of 8px (e.g. `size-4`) so every cell stays
 * crisp. They always sit beside a text label, never alone.
 */
import type { Pixels } from "./pixels";

export const GLYPHS = {
  github: [
    "..####..",
    ".######.",
    "##.##.##",
    "########",
    "########",
    ".######.",
    "#.####..",
    ".#.##.#.",
  ],
  linkedin: [
    "########",
    "#.######",
    "########",
    "#.#..#.#",
    "#.#.#.##",
    "#.#.##.#",
    "#.#.##.#",
    "########",
  ],
  mail: [
    "........",
    "########",
    "##....##",
    "#.#..#.#",
    "#..##..#",
    "#......#",
    "########",
    "........",
  ],
  arrow: [
    "..######",
    "......##",
    ".....#.#",
    "....#..#",
    "...#...#",
    "..#....#",
    ".#......",
    "#.......",
  ],
  copy: [
    "..######",
    "..#....#",
    "######.#",
    "#....#.#",
    "#....#.#",
    "#....###",
    "#....#..",
    "######..",
  ],
  check: [
    "........",
    ".......#",
    "......##",
    "#....##.",
    "##..##..",
    ".####...",
    "..##....",
    "........",
  ],
} satisfies Record<string, Pixels>;

export type GlyphName = keyof typeof GLYPHS;
