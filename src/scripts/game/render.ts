/**
 * Draws the aquarium and a game state onto a canvas whose transform maps
 * logical pixels. The water is Bayer-dithered between bands of blue (the
 * same 1-bit trick as the site's dither), cached per tank size.
 */
import { BAYER_8 } from "@/lib/bayer";
import {
  FISH,
  GOLDFISH,
  STARFISH,
  TONY_BLINK,
  TONY_HAPPY,
  TONY_OUCH,
  TONY_SIT,
  TONY_SLEEP,
  ZZ,
  flip,
} from "@/lib/sprites";

import { FLOOR, H, type State } from "./engine";
import { spriteCanvas } from "./sprite-cache";

/** Surface to floor: shallow aqua down to deep blue. */
const WATER = ["#c4eef7", "#93dbee", "#62c3e4", "#3fa7d5", "#2e8bc0"];
const SAND = "#f1dfab";
const SAND_DARK = "#dcc58a";
const PEBBLE = "#c4a66c";
const SURFACE = "#effbfd";
const WEED = "#3faa72";
const WEED_DARK = "#2a8457";

const FISH_LEFT = flip(FISH);
const GOLD_LEFT = flip(GOLDFISH);

/** Cheap deterministic hash for scenery placement. */
const noise = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const blit = (
  context: CanvasRenderingContext2D,
  pixels: readonly string[],
  x: number,
  y: number,
): void =>
  context.drawImage(spriteCanvas(pixels), Math.round(x), Math.round(y));

/* Background: water bands with dithered seams, then sand. */

let backdrop: HTMLCanvasElement | null = null;

function paintBackdrop(width: number): HTMLCanvasElement {
  if (backdrop?.width === width) return backdrop;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = H;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const rgb = WATER.map((hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]);
  const image = context.createImageData(width, H);
  for (let y = 0; y < FLOOR; y++) {
    const depth = (y / FLOOR) * (WATER.length - 1);
    const band = Math.floor(depth);
    const frac = depth - band;
    for (let x = 0; x < width; x++) {
      const threshold = ((BAYER_8[(y & 7) * 8 + (x & 7)] ?? 0) + 0.5) / 64;
      const [r, g, b] = rgb[frac > threshold ? band + 1 : band] ?? [0, 0, 0];
      const i = (y * width + x) * 4;
      image.data[i] = r ?? 0;
      image.data[i + 1] = g ?? 0;
      image.data[i + 2] = b ?? 0;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  context.fillStyle = SAND;
  context.fillRect(0, FLOOR, width, H - FLOOR);
  context.fillStyle = SAND_DARK;
  context.fillRect(0, FLOOR, width, 1);
  for (let i = 0; i < width / 5; i++) {
    context.fillStyle = noise(i + 9) > 0.6 ? PEBBLE : SAND_DARK;
    context.fillRect(
      Math.floor(noise(i) * width),
      FLOOR + 2 + Math.floor(noise(i + 3) * (H - FLOOR - 3)),
      noise(i + 5) > 0.75 ? 2 : 1,
      1,
    );
  }

  // Glass glints in the top-left corner.
  context.fillStyle = "rgb(255 255 255 / 0.55)";
  for (let i = 0; i < 10; i++) context.fillRect(4 + i, 16 - i, 1, 1);
  for (let i = 0; i < 5; i++) context.fillRect(4 + i, 22 - i, 1, 1);

  backdrop = canvas;
  return canvas;
}

/* Scenery that moves: the surface, seaweed and bubbles. */

function drawSurface(
  context: CanvasRenderingContext2D,
  width: number,
  clock: number,
): void {
  context.fillStyle = SURFACE;
  for (let x = 0; x < width; x += 2) {
    const y = 3 + Math.round(Math.sin(x * 0.12 + clock * 1.8) * 1.2);
    context.fillRect(x, y, 2, 1);
  }
}

function seaweedSpots(width: number): { x: number; h: number }[] {
  const count = Math.max(2, Math.floor(width / 70));
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(((i + 0.3 + noise(i + 21) * 0.4) / count) * width),
    h: 16 + Math.round(noise(i + 31) * 18),
  }));
}

function drawSeaweed(
  context: CanvasRenderingContext2D,
  width: number,
  clock: number,
): void {
  for (const [i, spot] of seaweedSpots(width).entries()) {
    for (const strand of [0, 3]) {
      const height = spot.h - strand * 2;
      for (let y = 0; y < height; y += 2) {
        const sway = Math.sin(clock * 1.4 + y * 0.22 + i + strand) * (y / 14);
        context.fillStyle = (y / 2 + strand) % 4 < 2 ? WEED : WEED_DARK;
        context.fillRect(
          Math.round(spot.x + strand + sway),
          FLOOR - 2 - y,
          2,
          2,
        );
      }
    }
  }
}

interface Bubble {
  x: number;
  y: number;
  size: 1 | 2;
  speed: number;
  phase: number;
}

let bubbles: Bubble[] = [];
let bubblesFor = 0;
let lastClock = 0;

function drawBubbles(
  context: CanvasRenderingContext2D,
  width: number,
  clock: number,
): void {
  if (bubblesFor !== width) {
    bubblesFor = width;
    bubbles = Array.from({ length: Math.ceil(width / 28) }, (_, i) => ({
      x: noise(i + 41) * width,
      y: noise(i + 51) * FLOOR,
      size: noise(i + 61) > 0.6 ? 2 : 1,
      speed: 10 + noise(i + 71) * 14,
      phase: noise(i + 81) * 6,
    }));
  }
  const dt = Math.min(0.1, Math.max(0, clock - lastClock));
  lastClock = clock;

  for (const bubble of bubbles) {
    bubble.y -= bubble.speed * dt;
    if (bubble.y < 5) {
      bubble.y = FLOOR - 2;
      bubble.x = Math.random() * width;
    }
    const x = Math.round(bubble.x + Math.sin(clock * 2 + bubble.phase) * 1.5);
    const y = Math.round(bubble.y);
    if (bubble.size === 1) {
      context.fillStyle = "rgb(255 255 255 / 0.6)";
      context.fillRect(x, y, 1, 1);
    } else {
      // A tiny ring with a bright corner.
      context.fillStyle = "rgb(255 255 255 / 0.5)";
      context.fillRect(x + 1, y, 2, 1);
      context.fillRect(x + 1, y + 3, 2, 1);
      context.fillRect(x, y + 1, 1, 2);
      context.fillRect(x + 3, y + 1, 1, 2);
      context.fillStyle = "rgb(255 255 255 / 0.9)";
      context.fillRect(x + 1, y + 1, 1, 1);
    }
  }
}

/**
 * `clock` is seconds since the page loaded; it drives the scenery, which
 * keeps moving while the game is idle. `still` freezes it (reduced motion).
 */
export function draw(
  context: CanvasRenderingContext2D,
  s: State,
  clock: number,
  still: boolean,
): void {
  const time = still ? 0 : clock;
  context.drawImage(paintBackdrop(s.width), 0, 0);
  drawSurface(context, s.width, time);
  drawSeaweed(context, s.width, time);
  if (!still) drawBubbles(context, s.width, clock);

  for (const item of s.items) {
    if (item.landed !== null && Math.floor(item.landed * 10) % 2 === 1) {
      continue; // Landed items blink out.
    }
    if (item.kind === "starfish") {
      blit(context, STARFISH, item.x, item.y);
    } else if (item.kind === "gold") {
      blit(context, item.flip ? GOLD_LEFT : GOLDFISH, item.x, item.y);
      if (Math.floor(clock * 6) % 3 === 0) {
        context.fillStyle = "#ffffff";
        context.fillRect(Math.round(item.x + 5), Math.round(item.y - 2), 1, 1);
      }
    } else {
      blit(context, item.flip ? FISH_LEFT : FISH, item.x, item.y);
    }
  }

  const { tony } = s;
  const walking = s.phase === "running" && Math.floor(tony.stride / 5) % 2;
  const y = tony.y - (walking ? 1 : 0);
  if (s.phase === "idle") {
    blit(context, TONY_SLEEP, tony.x, tony.y);
    const drift = still ? 0 : (clock * 0.5) % 1;
    context.globalAlpha = drift < 0.8 ? 1 : (1 - drift) * 5;
    blit(context, ZZ, tony.x + 12 + drift * 5, tony.y - 4 - drift * 12);
    context.globalAlpha = 1;
  } else if (s.phase === "over" || s.ouchFor > 0) {
    blit(context, TONY_OUCH, tony.x, y);
  } else if (s.happyFor > 0) {
    blit(context, TONY_HAPPY, tony.x, y);
  } else {
    const blinking = !still && clock % 3.4 < 0.14;
    blit(context, blinking ? TONY_BLINK : TONY_SIT, tony.x, y);
  }
}
