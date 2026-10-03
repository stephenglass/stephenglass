import assert from "node:assert/strict";
import { test } from "node:test";

import { reactionTo } from "./petting.ts";

test("a pet is a heart and a one-cell hop", () => {
  assert.deepEqual(reactionTo(1), {
    particle: "heart",
    hop: 1,
    earFlick: false,
    meow: false,
    flight: false,
  });
});

test("milestones: meow at 15, fish at 20, ear flick at 30, flight at 50", () => {
  assert.equal(reactionTo(15).meow, true);
  assert.equal(reactionTo(20).particle, "fish");
  assert.equal(reactionTo(20).hop, 3);
  assert.equal(reactionTo(30).earFlick, true);
  assert.equal(reactionTo(30).hop, 0);
  assert.equal(reactionTo(50).flight, true);
});
