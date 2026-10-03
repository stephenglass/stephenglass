import assert from "node:assert/strict";
import { test } from "node:test";

import { faviconSvg } from "./icon.ts";
import { INK, PAPER } from "./palette.ts";

test("the icon is only paper and ink", () => {
  const fills = [...faviconSvg().matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(fills, [PAPER, INK]);
});

test("the dot sits in the middle of the tile", () => {
  const [, x, y, size] =
    faviconSvg().match(/x="(\d+)" y="(\d+)" width="(\d+)"/) ?? [];
  assert.equal(Number(x) * 2 + Number(size), 32);
  assert.equal(Number(y) * 2 + Number(size), 32);
});
