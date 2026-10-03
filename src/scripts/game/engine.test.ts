import assert from "node:assert/strict";
import { test } from "node:test";

import {
  catchBox,
  createState,
  FLOOR,
  press,
  update,
  type Item,
  type ItemKind,
  type State,
} from "./engine.ts";

const STEP = 1 / 120;

/** Drop an item straight onto Tony's head. */
function dropOnTony(s: State, kind: ItemKind): void {
  const zone = catchBox(s.tony);
  const w = kind === "starfish" ? 9 : 11;
  const h = kind === "starfish" ? 9 : 6;
  const x = zone.x + zone.w / 2 - w / 2;
  const item: Item = {
    kind,
    x,
    y: zone.y - h - 1,
    w,
    h,
    baseX: x,
    vy: 60,
    wobble: -s.time * 2.2, // keeps sin(...) at zero this step
    flip: false,
    landed: null,
  };
  s.items.push(item);
}

function running(): State {
  const s = createState(200);
  press(s);
  s.untilSpawn = Infinity; // only the items each test drops
  return s;
}

test("starts idle and begins on a press", () => {
  const s = createState(200);
  assert.equal(s.phase, "idle");
  press(s);
  assert.equal(s.phase, "running");
});

test("catching fish scores, golden fish score more", () => {
  const s = running();
  dropOnTony(s, "fish");
  for (let i = 0; i < 30; i++) update(s, STEP);
  assert.equal(s.score, 1);
  dropOnTony(s, "gold");
  for (let i = 0; i < 30; i++) update(s, STEP);
  assert.equal(s.score, 6);
});

test("three starfish end the round", () => {
  const s = running();
  for (let lost = 1; lost <= 3; lost++) {
    dropOnTony(s, "starfish");
    for (let i = 0; i < 30 && s.phase === "running"; i++) update(s, STEP);
    assert.equal(s.lives, 3 - lost);
  }
  assert.equal(s.phase, "over");
  assert.deepEqual(s.events.at(-1), { type: "over", score: 0 });
});

test("missed fish land on the sand and go", () => {
  const s = running();
  s.tony.x = 2;
  s.items.push({
    kind: "fish",
    x: 150,
    y: FLOOR - 10,
    w: 11,
    h: 6,
    baseX: 150,
    vy: 60,
    wobble: 0,
    flip: false,
    landed: null,
  });
  for (let i = 0; i < 30; i++) update(s, STEP);
  assert.notEqual(s.items[0]?.landed, null);
  for (let i = 0; i < 120; i++) update(s, STEP);
  assert.equal(s.items.length, 0);
  assert.equal(s.score, 0);
});

test("Tony stays inside the tank", () => {
  const s = running();
  s.right = true;
  for (let i = 0; i < 600; i++) update(s, STEP);
  assert.ok(s.tony.x + s.tony.w <= s.width - 2);
});
