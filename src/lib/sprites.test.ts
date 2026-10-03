import assert from "node:assert/strict";
import { test } from "node:test";

import { sizeOf } from "./pixels.ts";
import {
  PALETTE,
  TONY_BLINK,
  TONY_HI_BLINK,
  TONY_HI_SIT,
  TONY_LIT_BLINK,
  TONY_LIT_SIT,
  TONY_SIT,
  ZZ,
} from "./sprites.ts";

const silhouette = (pixels: readonly string[]): string =>
  pixels.join("\n").replaceAll(/[^.\n]/g, "#");
const eyes = (pixels: readonly string[]): string =>
  pixels.join("\n").replaceAll(/[^w\n]/g, ".");

test("each Tony's frames share one silhouette", () => {
  for (const [sit, blink] of [
    [TONY_SIT, TONY_BLINK],
    [TONY_HI_SIT, TONY_HI_BLINK],
    [TONY_LIT_SIT, TONY_LIT_BLINK],
  ] as const) {
    assert.deepEqual(sizeOf(blink), sizeOf(sit));
    assert.equal(silhouette(blink), silhouette(sit));
    assert.match(sit.join(""), /w/, "open eyes");
    assert.doesNotMatch(blink.join(""), /w/, "shut eyes");
  }
});

test("rows are all the same width", () => {
  for (const pixels of [TONY_SIT, TONY_HI_SIT, TONY_LIT_SIT]) {
    const { width } = sizeOf(pixels);
    for (const row of pixels) assert.equal(row.length, width);
  }
});

test("light keeps the silhouette and the eyes", () => {
  assert.equal(silhouette(TONY_LIT_SIT), silhouette(TONY_HI_SIT));
  assert.equal(eyes(TONY_LIT_SIT), eyes(TONY_HI_SIT));
  assert.match(TONY_LIT_SIT.join(""), /d/, "some cells are lit");
  // Light comes from the right: the floor row is dark at its left end.
  assert.equal(TONY_LIT_SIT.at(-1)?.replace(/^\.+/, "")[0], "k");
});

test("every sprite key has a fill", () => {
  for (const pixels of [TONY_SIT, TONY_LIT_SIT, TONY_LIT_BLINK, ZZ]) {
    for (const cell of pixels.join("").replaceAll(".", "")) {
      assert.ok(PALETTE[cell], `no fill for "${cell}"`);
    }
  }
});
