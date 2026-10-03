import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveLayout } from "./layout.ts";

test("a stored choice wins over the screen's default", () => {
  assert.equal(resolveLayout("compact", true), "compact");
  assert.equal(resolveLayout("full", false), "full");
});

test("without a valid choice, the screen decides", () => {
  assert.equal(resolveLayout(null, true), "full");
  assert.equal(resolveLayout(null, false), "compact");
  assert.equal(resolveLayout("wide", true), "full");
});
