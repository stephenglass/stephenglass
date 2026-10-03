/** 4×4 Bayer matrix, values 0–15, for Tony's light and dissolves. */
const BAYER_4: readonly number[] = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
];

/** 8×8 Bayer matrix, values 0–63, for the Tonelabs dither. */
export const BAYER_8: readonly number[] = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

/** Whether cell (x, y) is on at `amount` (0–1) under 4×4 ordered dithering. */
export const bayerOn = (x: number, y: number, amount: number): boolean =>
  amount * 16 > (BAYER_4[(y & 3) * 4 + (x & 3)] ?? 0) + 0.5;
