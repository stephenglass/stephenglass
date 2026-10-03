import assert from "node:assert/strict";
import { test } from "node:test";

import { beamsIntensity, renderDither, type Rgba } from "./dither.ts";

const W = 64;
const H = 16;
const BONE: Rgba = [246, 236, 221, 96];

const render = (density: number, t = 3): Uint8ClampedArray => {
  const buffer = new Uint8ClampedArray(W * H * 4);
  renderDither(buffer, W, H, beamsIntensity, t, BONE, density);
  return buffer;
};

const litCount = (buffer: Uint8ClampedArray): number => {
  let lit = 0;
  for (let i = 3; i < buffer.length; i += 4) if (buffer[i]) lit += 1;
  return lit;
};

test("writes only the given colour, lit or transparent", () => {
  const buffer = render(1);
  for (let i = 0; i < buffer.length; i += 4) {
    assert.deepEqual([...buffer.subarray(i, i + 3)], BONE.slice(0, 3));
    assert.ok(buffer[i + 3] === 0 || buffer[i + 3] === BONE[3]);
  }
});

test("density 0 leaves the field empty; density 1 lights part of it", () => {
  assert.equal(litCount(render(0)), 0);
  const lit = litCount(render(1));
  assert.ok(lit > 0 && lit < W * H, `lit ${lit}`);
});

test("beam intensity stays within 0–1", () => {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = beamsIntensity(x, y, 7.5, W, H);
      assert.ok(v >= 0 && v <= 1, `${v} at ${x},${y}`);
    }
  }
});
