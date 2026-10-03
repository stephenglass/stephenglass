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
import { PALETTE, TONY_LIT_SIT, TONY_SIT } from "../src/lib/sprites.ts";

const root = (path: string): string =>
  fileURLToPath(new URL(`../${path}`, import.meta.url));

const PAPER = "#F7F6F4";
const INK = "#16131A";
const INK_DIM = "#5C5762";
/** ink/10 on paper, as the page's hairlines. */
const RULE = "#E0DEDD";
/** "Stephen Glass" is 6.3em of ink: fill the 1040px between the margins. */
const NAME_PX = 1040 / 6.3;

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
    // The home page in brief: the name fitted to the width, then Tony on
    // the links' top rule.
    body: `<div class="fill" style="background:${PAPER};padding:0 80px;display:flex;flex-direction:column;justify-content:center">
      <h1 style="color:${INK};font-size:${NAME_PX}px;font-weight:650;letter-spacing:-0.04em;line-height:0.86;margin-left:-0.027em">Stephen Glass</h1>
      <div style="position:relative;margin-top:150px;border-top:1px solid ${RULE}">
        <div style="position:absolute;right:16px;bottom:100%">${toSvg(TONY_LIT_SIT, PALETTE, 4)}</div>
        <p style="color:${INK_DIM};font-size:28px;font-weight:450;padding-top:24px">stephen.glass</p>
      </div>
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
