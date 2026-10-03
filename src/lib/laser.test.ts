import assert from "node:assert/strict";
import { test } from "node:test";

import { gazeFor, nextMove, snap, tremor, visitPlan } from "./laser.ts";

/** A seeded generator (mulberry32), so failures repeat. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("snap keeps the dot on whole cells and on the line", () => {
  const track = { from: 0, min: 0, max: 100, cell: 3 };
  assert.equal(snap(4, track), 3);
  assert.equal(snap(5, track), 6);
  assert.equal(snap(-20, track), 0);
  assert.equal(snap(500, track), 99);
});

test("moves stay on the line, on whole cells, with sane timing", () => {
  const random = seeded(7);
  const track = { from: 0, min: 0, max: 600, cell: 3 };
  let creeps = 0;
  for (let i = 0; i < 2000; i++) {
    const move = nextMove(random, track);
    assert.ok(move.to >= track.min && move.to <= track.max, `to ${move.to}`);
    assert.equal(move.to % track.cell, 0);
    assert.ok(move.duration >= 100 && move.duration <= 2200);
    assert.ok(move.hold >= 150 && move.hold <= 1500);
    if (move.creep) creeps += 1;
    track.from = move.to;
  }
  assert.ok(creeps > 100 && creeps < 600, `${creeps} creeps`);
});

test("a tremor is at most one cell", () => {
  const random = seeded(3);
  const seen = new Set<number>();
  for (let i = 0; i < 500; i++) seen.add(tremor(random));
  assert.deepEqual([...seen].sort(), [-1, 0, 1]);
});

test("visits are short and the gaps long", () => {
  const random = seeded(11);
  for (let i = 0; i < 200; i++) {
    const { length, gap } = visitPlan(random);
    assert.ok(length >= 10_000 && length <= 15_000);
    assert.ok(gap >= 30_000 && gap <= 60_000);
  }
});

test("Tony looks toward the dot, and ahead when it's close or gone", () => {
  assert.equal(gazeFor(null, 500, 40), "ahead");
  assert.equal(gazeFor(100, 500, 40), "left");
  assert.equal(gazeFor(480, 500, 40), "ahead");
});

test("hysteresis holds his gaze near the edge", () => {
  // 42px left of his eyes: just past a 40px dead zone.
  assert.equal(gazeFor(458, 500, 40, "ahead", 6), "ahead");
  assert.equal(gazeFor(458, 500, 40, "left", 6), "left");
  assert.equal(gazeFor(470, 500, 40, "left", 6), "ahead");
});
