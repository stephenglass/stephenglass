import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import * as palette from "./palette.ts";

test("global.css declares the same colours", async () => {
  const css = await readFile(
    new URL("../styles/global.css", import.meta.url),
    "utf8",
  );
  for (const [name, value] of Object.entries(palette)) {
    const token = name.toLowerCase().replaceAll("_", "-");
    assert.match(css, new RegExp(`--color-${token}: ${value};`), token);
  }
});
