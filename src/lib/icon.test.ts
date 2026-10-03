import assert from "node:assert/strict";
import { test } from "node:test";

import { faviconSvg, ICON_INK, ICON_PAPER } from "./icon.ts";

test("the icon is only paper and ink", () => {
  const fills = [...faviconSvg().matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(fills, [ICON_PAPER, ICON_INK]);
});

test("the dot sits in the middle of the tile", () => {
  const [, x, y, size] =
    faviconSvg().match(/x="(\d+)" y="(\d+)" width="(\d+)"/) ?? [];
  assert.equal(Number(x) * 2 + Number(size), 32);
  assert.equal(Number(y) * 2 + Number(size), 32);
});
