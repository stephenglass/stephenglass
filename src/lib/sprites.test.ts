import assert from "node:assert/strict";
import { test } from "node:test";

import { sizeOf } from "./pixels.ts";
import {
  DISSOLVE_STAGES,
  dissolve,
  FISH,
  HEART,
  LASER,
  MOUSE,
  PALETTE,
  TONY_BLINK,
  TONY_HI_BLINK,
  TONY_HI_EAR_FLICK,
  TONY_HI_HAPPY,
  TONY_HI_LOOK_LEFT,
  TONY_HI_SIT,
  TONY_LIT_BLINK,
  TONY_LIT_EAR_FLICK,
  TONY_LIT_HAPPY,
  TONY_LIT_LOOK_LEFT,
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

test("Tony looks left by one pixel, nothing else changing", () => {
  const shiftLeft = (pixels: readonly string[]): string =>
    eyes(pixels)
      .split("\n")
      .map((row) => row.slice(1) + ".")
      .join("\n");
  for (const [sit, left] of [
    [TONY_HI_SIT, TONY_HI_LOOK_LEFT],
    [TONY_LIT_SIT, TONY_LIT_LOOK_LEFT],
  ] as const) {
    assert.equal(silhouette(left), silhouette(sit));
    assert.equal(eyes(left), shiftLeft(sit));
  }
});

test("happy Tony only changes his eyes; the ear flick only his ears", () => {
  const rows = (pixels: readonly string[], from: number, to?: number) =>
    pixels.slice(from, to).join("\n");
  assert.equal(silhouette(TONY_HI_HAPPY), silhouette(TONY_HI_SIT));
  assert.equal(silhouette(TONY_LIT_HAPPY), silhouette(TONY_LIT_SIT));
  assert.notEqual(eyes(TONY_HI_HAPPY), eyes(TONY_HI_SIT));
  assert.deepEqual(sizeOf(TONY_HI_EAR_FLICK), sizeOf(TONY_HI_SIT));
  assert.notEqual(rows(TONY_HI_EAR_FLICK, 0, 3), rows(TONY_HI_SIT, 0, 3));
  assert.equal(rows(TONY_HI_EAR_FLICK, 3), rows(TONY_HI_SIT, 3));
  assert.equal(eyes(TONY_LIT_EAR_FLICK), eyes(TONY_LIT_SIT));
});

test("particles dissolve in Bayer order, a little more at each stage", () => {
  for (const pixels of [HEART, MOUSE, FISH]) {
    assert.deepEqual(dissolve(pixels, 0), pixels);
    assert.match(dissolve(pixels, 1).join(""), /^\.+$/);
    let before = pixels.join("\n");
    for (const amount of DISSOLVE_STAGES.slice(1)) {
      const after = dissolve(pixels, amount).join("\n");
      assert.ok(after.length === before.length);
      for (let i = 0; i < after.length; i++)
        if (after[i] !== ".") assert.equal(after[i], before[i]);
      assert.notEqual(after, before, `stage ${amount} takes cells away`);
      before = after;
    }
  }
});

test("rows are all the same width", () => {
  for (const pixels of [
    TONY_SIT,
    TONY_HI_SIT,
    TONY_LIT_SIT,
    TONY_HI_EAR_FLICK,
    LASER,
    HEART,
    MOUSE,
    FISH,
  ]) {
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
  for (const pixels of [
    TONY_SIT,
    TONY_LIT_SIT,
    TONY_LIT_BLINK,
    TONY_LIT_LOOK_LEFT,
    TONY_LIT_HAPPY,
    TONY_LIT_EAR_FLICK,
    LASER,
    ZZ,
    HEART,
    MOUSE,
    FISH,
  ]) {
    for (const cell of pixels.join("").replaceAll(".", "")) {
      assert.ok(PALETTE[cell], `no fill for "${cell}"`);
    }
  }
});
