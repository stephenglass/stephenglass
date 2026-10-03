/**
 * Renders the PNG icons and the social image from the same sprites the site
 * uses, with the real Instrument Sans file. Run with
 * `npm run brand:assets` (Node 24 strips the types natively). Outputs in
 * public/ are committed, so this only needs re-running when they change.
 * Adapted from tonelabs' script of the same name.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "@playwright/test";

import { toSvg } from "../src/lib/pixels.ts";
import { PALETTE, TONY_SIT } from "../src/lib/sprites.ts";

const root = (path: string): string =>
  fileURLToPath(new URL(`../${path}`, import.meta.url));

const PAPER = "#F7F6F4";
const INK = "#16131A";
const INK_DIM = "#5C5762";
const AQUA = "#2FA3C4";

interface Asset {
  path: string;
  width: number;
  height: number;
  body: string;
}

/** Tony at `cell` px per pixel. */
const tony = (cell: number): string => toSvg(TONY_SIT, PALETTE, cell);

const icon = (path: string, size: number, cell: number): Asset => ({
  path,
  width: size,
  height: size,
  body: `<div class="fill center" style="background:${PAPER}">${tony(cell)}</div>`,
});

const assets: Asset[] = [
  icon("public/favicon-32x32.png", 32, 1),
  icon("public/apple-touch-icon.png", 180, 8),
  {
    path: "public/og.png",
    width: 1200,
    height: 630,
    body: `<div class="fill" style="background:${PAPER};padding:0 96px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <p style="color:${INK_DIM};font-size:26px;font-weight:600;display:flex;align-items:center;gap:14px">
          <span style="width:12px;height:12px;border-radius:50%;background:${AQUA}"></span>stephen.glass</p>
        <h1 style="color:${INK};font-size:124px;font-weight:600;font-stretch:85%;letter-spacing:-0.03em;line-height:0.92;margin-top:40px">stephen<br>glass</h1>
        <p style="color:${INK};font-size:42px;font-weight:600;letter-spacing:-0.035em;margin-top:36px">software engineer.</p>
      </div>
      <div style="align-self:flex-end;margin-bottom:96px">${tony(14)}</div>
    </div>`,
  },
];

async function render(
  page: Page,
  asset: Asset,
  fontUrl: string,
): Promise<void> {
  await page.setViewportSize({ width: asset.width, height: asset.height });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Instrument; src: url(${fontUrl}) format("woff2"); font-weight: 400 700; font-stretch: 75% 100%; }
    * { margin: 0; box-sizing: border-box; }
    body { width: ${asset.width}px; height: ${asset.height}px; font-family: Instrument; }
    .fill { width: 100%; height: 100%; }
    .center { display: flex; align-items: center; justify-content: center; }
    .mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; }
    svg { display: block; }
  </style></head><body>${asset.body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: root(asset.path) });
}

const font = await readFile(
  root("src/assets/fonts/InstrumentSans-Variable.woff2"),
);
const fontUrl = `data:font/woff2;base64,${font.toString("base64")}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const asset of assets) await render(page, asset, fontUrl);
} finally {
  await browser.close();
}

console.log("Brand assets written to public/");
