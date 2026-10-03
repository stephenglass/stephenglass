import assert from "node:assert/strict";
import { test } from "node:test";

import { DISSOLVE_STAGES, dissolve, sizeOf, withLight } from "./pixels.ts";
import {
  LASER,
  PALETTE,
  PARTICLES,
  TONY_EYE_COL,
  TONY_FRAMES,
  TONY_PAWS_COL,
  TONY_SLEEP,
  ZZ,
} from "./sprites.ts";

const silhouette = (pixels: readonly string[]): string =>
  pixels.join("\n").replaceAll(/[^.\n]/g, "#");
const eyes = (pixels: readonly string[]): string =>
  pixels.join("\n").replaceAll(/[^w\n]/g, ".");

const { sit, blink, happy } = TONY_FRAMES;
const lookLeft = TONY_FRAMES["look-left"];
const earFlick = TONY_FRAMES["ear-flick"];

test("Tony's frames share one silhouette", () => {
  for (const frame of [blink, lookLeft, happy]) {
    assert.deepEqual(sizeOf(frame), sizeOf(sit));
    assert.equal(silhouette(frame), silhouette(sit));
  }
  assert.match(sit.join(""), /w/, "open eyes");
  assert.doesNotMatch(blink.join(""), /w/, "shut eyes");
  assert.notEqual(eyes(happy), eyes(sit));
});

test("Tony looks left by one pixel, nothing else changing", () => {
  const shiftLeft = (pixels: readonly string[]): string =>
    eyes(pixels)
      .split("\n")
      .map((row) => row.slice(1) + ".")
      .join("\n");
  assert.equal(eyes(lookLeft), shiftLeft(sit));
});

test("the ear flick only changes his ears", () => {
  const below = (pixels: readonly string[]) => silhouette(pixels.slice(3));
  assert.deepEqual(sizeOf(earFlick), sizeOf(sit));
  assert.notEqual(
    silhouette(earFlick.slice(0, 3)),
    silhouette(sit.slice(0, 3)),
  );
  assert.equal(below(earFlick), below(sit));
  assert.equal(eyes(earFlick), eyes(sit));
});

test("Tony's measurements come from his drawing", () => {
  assert.equal(TONY_PAWS_COL, 1);
  assert.equal(TONY_EYE_COL, 8.5);
});

test("light keeps the silhouette and other keys, and comes from the right", () => {
  const block = ["kkkkkk", "kkwkkk", "kkkkkk", "kkkkkk", "kkkkkk"];
  const lit = withLight(block, 3, 0.8);
  assert.equal(silhouette(lit), silhouette(block));
  assert.equal(eyes(lit), eyes(block));
  assert.match(lit.join(""), /d/, "some cells are lit");
  // The floor row is dark at its left end.
  assert.equal(sit.at(-1)?.replace(/^\.+/, "")[0], "k");
});

test("particles dissolve in Bayer order, a little more at each stage", () => {
  for (const pixels of Object.values(PARTICLES)) {
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

const ALL = [
  TONY_SLEEP,
  ZZ,
  LASER,
  ...Object.values(TONY_FRAMES),
  ...Object.values(PARTICLES),
];

test("rows are all the same width", () => {
  for (const pixels of ALL) {
    const { width } = sizeOf(pixels);
    for (const row of pixels) assert.equal(row.length, width);
  }
});

test("every sprite key has a fill", () => {
  for (const pixels of ALL) {
    for (const cell of pixels.join("").replaceAll(".", "")) {
      assert.ok(PALETTE[cell], `no fill for "${cell}"`);
    }
  }
});
