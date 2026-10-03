/**
 * Mounts Fish Catch: sizing, input, the loop, HUD and announcements. `root`
 * holds the HUD and copy; the focusable `[data-game-tile]` frame inside it is
 * the only thing that listens for keys, so Space and the arrows scroll the
 * page as usual unless the game has focus.
 */
import {
  createState,
  H,
  pause,
  point,
  press,
  steer,
  togglePause,
  update,
  type State,
} from "./engine";
import { draw } from "./render";
import { getBest, setBest } from "./storage";

const STEP = 1 / 120;
const MAX_FRAME = 0.05;
/** Idle scenery is gentle; redraw it at about this rate. */
const IDLE_FRAME_MS = 1000 / 30;
/** Narrowest tank, in logical pixels, before the scale drops. */
const MIN_WIDTH = 140;

const START_KEYS = new Set(["Space", "Enter"]);
const LEFT_KEYS = new Set(["ArrowLeft", "KeyA"]);
const RIGHT_KEYS = new Set(["ArrowRight", "KeyD"]);
const PAUSE_KEYS = new Set(["KeyP", "Escape"]);

const pad = (n: number): string => String(n).padStart(3, "0");

function mountGame(root: HTMLElement): void {
  const tile = root.querySelector<HTMLElement>("[data-game-tile]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-game-canvas]");
  const frame = root.querySelector<HTMLElement>("[data-game-frame]");
  const scoreEl = root.querySelector<HTMLElement>("[data-game-score]");
  const bestEl = root.querySelector<HTMLElement>("[data-game-best]");
  const livesEl = root.querySelector<HTMLElement>("[data-game-lives]");
  const message = root.querySelector<HTMLElement>("[data-game-message]");
  const status = root.querySelector<HTMLElement>("[data-game-status]");
  const floats = root.querySelector<HTMLElement>("[data-game-floats]");
  const context = canvas?.getContext("2d");
  if (
    !tile ||
    !canvas ||
    !frame ||
    !scoreEl ||
    !bestEl ||
    !livesEl ||
    !message ||
    !status ||
    !floats ||
    !context
  )
    return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  const state: State = createState(MIN_WIDTH);
  const keys = { left: false, right: false };
  let best = getBest();
  let scale = 1; // device pixels per logical pixel
  let shown = "";
  let visible = true;
  let raf = 0;
  let last = 0;
  let accumulator = 0;
  let lastIdleDraw = 0;

  /* Sizing: whole device pixels per logical pixel keeps the art crisp. */
  const fit = (): void => {
    const box = frame.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    scale = Math.max(
      1,
      Math.min(
        Math.floor((box.height * dpr) / H),
        Math.floor((box.width * dpr) / MIN_WIDTH),
      ),
    );
    const width = Math.floor((box.width * dpr) / scale);
    canvas.width = width * scale;
    canvas.height = H * scale;
    canvas.style.width = `${(width * scale) / dpr}px`;
    canvas.style.height = `${(H * scale) / dpr}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = false;
    if (state.width !== width) {
      // Keep Tony in proportion when the tank resizes.
      state.tony.x = Math.round((state.tony.x / state.width) * width);
      state.width = width;
    }
    render(performance.now());
  };

  const render = (now: number): void => {
    draw(context, state, now / 1000, reducedMotion.matches);
    syncHud();
  };

  /* HUD and messages: touch the DOM only when something changed. */
  const syncHud = (): void => {
    const key = `${state.phase}|${state.score}|${state.lives}|${best}`;
    if (key === shown) return;
    shown = key;
    scoreEl.textContent = pad(state.score);
    bestEl.textContent = pad(best);
    livesEl.textContent = "♥".repeat(state.lives);
    livesEl.dataset.lost = "♥".repeat(3 - state.lives);
    tile.dataset.phase = state.phase;
    tile.classList.toggle("is-playing", state.phase === "running");
    const touch = coarse.matches;
    const start = touch ? "Tap" : "Press Space or click";
    message.textContent =
      state.phase === "idle"
        ? `${start} to play.`
        : state.phase === "paused"
          ? `Paused. ${start} to resume.`
          : state.phase === "over"
            ? `Game over. ${start} to play again.`
            : touch
              ? "Drag to move Tony."
              : "Move Tony with ← → or the mouse.";
  };

  const floatAt = (x: number, y: number, text: string): void => {
    const dpr = window.devicePixelRatio || 1;
    const el = document.createElement("span");
    el.className = "game-float";
    el.textContent = text;
    el.style.left = `${canvas.offsetLeft + ((x + 5) * scale) / dpr}px`;
    el.style.top = `${canvas.offsetTop + (y * scale) / dpr}px`;
    if (reducedMotion.matches) el.dataset.still = "";
    floats.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
    window.setTimeout(() => el.remove(), 1500);
  };

  const handleEvents = (): void => {
    for (const event of state.events) {
      if (event.type === "catch") {
        floatAt(event.x, event.y, event.kind === "gold" ? "+5" : "+1");
      } else if (event.type === "ouch") {
        floatAt(event.x, event.y, "−♥");
      } else {
        const newBest = event.score > best;
        if (newBest) {
          best = event.score;
          setBest(best);
        }
        status.textContent = `Game over. ${event.score} fish.${newBest ? " New best!" : ""}`;
      }
    }
    state.events.length = 0;
  };

  /* The loop: fixed steps while playing, gentle scenery otherwise. */
  const loop = (now: number): void => {
    raf = 0;
    if (!visible || document.hidden) return;

    if (state.phase === "running") {
      const frameTime = Math.min(MAX_FRAME, (now - last) / 1000);
      last = now;
      accumulator += frameTime;
      while (accumulator >= STEP) {
        update(state, STEP);
        accumulator -= STEP;
      }
      handleEvents();
      render(now);
    } else {
      update(state, Math.min(MAX_FRAME, (now - last) / 1000));
      last = now;
      if (now - lastIdleDraw >= IDLE_FRAME_MS) {
        lastIdleDraw = now;
        render(now);
      }
      // A still idle tank needs no loop at all.
      if (reducedMotion.matches && state.phase !== "over") return;
    }
    raf = requestAnimationFrame(loop);
  };

  const wake = (): void => {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    accumulator = 0;
    raf = requestAnimationFrame(loop);
  };

  const halt = (): void => {
    pause(state);
    keys.left = keys.right = false;
    steer(state, false, false);
    render(performance.now());
  };

  /* Keyboard, on the tile only. */
  tile.addEventListener("keydown", (event) => {
    if (event.target !== tile || event.metaKey || event.ctrlKey) return;
    const code = event.code;
    if (START_KEYS.has(code)) {
      event.preventDefault();
      if (!event.repeat) press(state);
    } else if (LEFT_KEYS.has(code) || RIGHT_KEYS.has(code)) {
      if (state.phase !== "running") return;
      event.preventDefault();
      if (LEFT_KEYS.has(code)) keys.left = true;
      else keys.right = true;
      steer(state, keys.left, keys.right);
    } else if (PAUSE_KEYS.has(code) && state.phase !== "idle") {
      event.preventDefault();
      togglePause(state);
    } else {
      return;
    }
    render(performance.now());
    wake();
  });
  tile.addEventListener("keyup", (event) => {
    if (LEFT_KEYS.has(event.code)) keys.left = false;
    if (RIGHT_KEYS.has(event.code)) keys.right = false;
    steer(state, keys.left, keys.right);
  });

  /* Pointer: tap to start, then Tony follows the pointer or finger. */
  const toLogical = (clientX: number): number => {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * state.width;
  };

  tile.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    tile.focus({ preventScroll: true });
    if (state.phase !== "running") press(state);
    point(state, toLogical(event.clientX));
    render(performance.now());
    wake();
  });
  tile.addEventListener("pointermove", (event) => {
    if (state.phase !== "running") return;
    // Mice steer by hovering; touch steers while the finger is down.
    if (event.pointerType === "mouse" || event.buttons) {
      point(state, toLogical(event.clientX));
    }
  });
  tile.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") point(state, null);
  });

  /* Pause whenever attention goes elsewhere; never resume on our own. */
  tile.addEventListener("focusout", halt);
  window.addEventListener("blur", halt);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) halt();
    else wake();
  });
  new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) wake();
      else halt();
    },
    { threshold: 0.3 },
  ).observe(tile);

  new ResizeObserver(fit).observe(frame);
  // Zooming changes the device pixel ratio without resizing the frame.
  window.addEventListener("resize", fit);
  reducedMotion.addEventListener("change", () => {
    render(performance.now());
    wake();
  });

  tile.dataset.ready = "";
  fit();
  wake();
}

document.querySelectorAll<HTMLElement>("[data-game]").forEach(mountGame);
