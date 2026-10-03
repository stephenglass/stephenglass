/**
 * Pet Tony. Everything he does stays on his pixel grid: each pet he shuts
 * his eyes in a ^ and hops a cell, and a pixel heart rises a cell at a time
 * and dissolves in Bayer order. Milestones carry over from the original
 * site: a fish and a higher hop every 20th pet, an ear flick every 30th, a
 * "meow." every 15th and a flight of hearts every 50th.
 * Hovering or focusing a while makes him purr: "prrr" and slow blinks. At
 * rest he looks whichever way the laser dot tells him (a `tony:gaze` event).
 *
 * Nothing rotates, scales or moves by less than a whole cell.
 */
import type { Gaze } from "@/lib/laser";

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

type Frame = "sit" | "look-left" | "blink" | "happy" | "ear-flick";
type Particle = "heart" | "fish";

/** Ms per cell of a hop, and of a particle's rise. */
const HOP_STEP = 60;
const RISE_STEP = 85;
/** Ms per dissolve stage. */
const DISSOLVE_STEP = 90;
/** How long a particle stays put under reduced motion, ms. */
const STILL_MS = 600;
/** Particles rise from above the middle of his head (cell column). */
const HEAD_COL = 8;

const particleFor = (n: number): Particle => (n % 20 === 0 ? "fish" : "heart");

const randomInt = (low: number, high: number): number =>
  low + Math.floor(Math.random() * (high - low + 1));

/** Keyframes that hold each offset (in cells) for an equal share of time. */
const stepped = (cells: number[], cell: number): Keyframe[] =>
  cells.map((c) => ({ translate: `0 ${c * cell}px`, easing: "steps(1, end)" }));

/** Up `height` cells, a beat at the top, and back down, one at a time. */
const hopCells = (height: number): number[] => [
  ...Array.from({ length: height }, (_, i) => -(i + 1)),
  -height,
  ...Array.from({ length: height }, (_, i) => -(height - 1 - i)),
];

function initPet(root: HTMLElement): void {
  const button = root.querySelector<HTMLButtonElement>("[data-pet]");
  const sprite = root.querySelector<HTMLElement>("[data-pet-sprite]");
  const layer = root.querySelector<HTMLElement>("[data-pet-layer]");
  const count = root.querySelector<HTMLElement>("[data-pet-count]");
  const caption = root.querySelector<HTMLElement>("[data-pet-caption]");
  if (!button || !sprite || !layer || !count || !caption) return;

  let pets = 0;
  let mood: Frame = "sit";
  let gaze: Gaze = "ahead";
  let busy = false;
  let sequenceTimer = 0;
  let blinkTimer = 0;
  let meowTimer = 0;
  let purrTimer = 0;
  let meowing = false;
  let purring = false;

  const cell = (): number =>
    parseFloat(getComputedStyle(root).getPropertyValue("--tony-cell")) || 3;

  const show = (frame: Frame): void => {
    mood = frame;
    sprite
      .querySelectorAll<SVGElement>("[data-frame]")
      .forEach((svg) =>
        svg.toggleAttribute("data-active", svg.dataset.frame === frame),
      );
  };

  const rest = (): Frame => (gaze === "ahead" ? "sit" : `look-${gaze}`);
  const resting = (): boolean => !busy && mood !== "blink";

  root.addEventListener("tony:gaze", (event) => {
    gaze = (event as CustomEvent<Gaze>).detail;
    if (resting()) show(rest());
  });

  /** Show frames in turn, each for its ms, then settle back to rest. */
  const play = (steps: readonly (readonly [Frame, number])[]): void => {
    window.clearTimeout(sequenceTimer);
    busy = true;
    const next = (i: number): void => {
      const step = steps[i];
      if (!step) {
        busy = false;
        show(rest());
        return;
      }
      show(step[0]);
      sequenceTimer = window.setTimeout(() => next(i + 1), step[1]);
    };
    next(0);
  };

  /** Shut his eyes for `ms`, unless something else has his attention. */
  const blink = (ms: number): void => {
    if (!resting() || document.hidden) return;
    show("blink");
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      if (mood === "blink") show(rest());
    }, ms);
  };

  const hop = (height: number): void => {
    if (reducedMotion) return;
    const cells = hopCells(height);
    sprite.getAnimations().forEach((animation) => animation.cancel());
    sprite.animate(stepped(cells, cell()), {
      duration: (cells.length - 1) * HOP_STEP,
    });
  };

  /** A pixel particle rises from his head and dissolves. */
  const rise = (kind: Particle, offset: number, height: number): void => {
    const template = root.querySelector<HTMLTemplateElement>(
      `template[data-particle="${kind}"]`,
    );
    const particle = template?.content.firstElementChild?.cloneNode(true);
    if (!(particle instanceof HTMLElement)) return;
    const width = Number(particle.style.getPropertyValue("--w")) || 7;
    particle.style.setProperty(
      "--x",
      String(Math.round(HEAD_COL - width / 2) + offset),
    );
    layer.append(particle);

    let travel = STILL_MS;
    if (!reducedMotion) {
      const cells = Array.from({ length: height + 1 }, (_, i) => -i);
      travel = height * RISE_STEP;
      particle.animate(stepped(cells, cell()), {
        duration: travel,
        fill: "forwards",
      });
    }

    // Dissolve over the last steps of the rise, then go.
    const stages = [...particle.querySelectorAll("[data-stage]")];
    stages.forEach((stage, i) => {
      if (i === 0) return;
      window.setTimeout(
        () => {
          stages[i - 1]?.removeAttribute("data-on");
          stage.setAttribute("data-on", "");
        },
        travel - (stages.length - 1 - i) * DISSOLVE_STEP,
      );
    });
    window.setTimeout(() => particle.remove(), travel + DISSOLVE_STEP);
  };

  /** Every 50th pet: a small flight of hearts, close around him. */
  const flight = (): void => {
    [-12, -6, 0, 6, 12].forEach((offset, i) =>
      window.setTimeout(
        () => rise("heart", offset + randomInt(-1, 1), randomInt(6, 8)),
        i * 120,
      ),
    );
  };

  /** What he says, in plain type beside his head: a meow beats a purr. */
  const say = (): void => {
    const text = meowing ? "meow." : purring ? "prrr" : "";
    if (text) caption.textContent = text;
    caption.hidden = !text;
  };

  button.addEventListener("click", () => {
    pets += 1;
    count.hidden = false;
    count.textContent = `×${pets}`;

    rise(particleFor(pets), randomInt(-3, 3), 5);
    if (pets % 50 === 0) flight();

    if (pets % 30 === 0) {
      play([
        ["ear-flick", 90],
        ["sit", 90],
        ["ear-flick", 90],
        ["happy", 250],
      ]);
    } else {
      play([["happy", 400]]);
      hop(pets % 20 === 0 ? 3 : 1);
    }

    if (pets % 15 === 0) {
      meowing = true;
      say();
      window.clearTimeout(meowTimer);
      meowTimer = window.setTimeout(() => {
        meowing = false;
        say();
      }, 1500);
    }
  });

  // Purr after a little attention (a long hover, or keyboard focus): he
  // says so, and blinks slowly, the way cats do at people they trust.
  const slowBlink = (): void => {
    if (!purring) return;
    blink(500);
    purrTimer = window.setTimeout(slowBlink, 2000);
  };
  const startPurr = (): void => {
    window.clearTimeout(purrTimer);
    purrTimer = window.setTimeout(() => {
      purring = true;
      say();
      purrTimer = window.setTimeout(slowBlink, 600);
    }, 800);
  };
  const stopPurr = (): void => {
    window.clearTimeout(purrTimer);
    purring = false;
    say();
  };
  button.addEventListener("pointerenter", () => {
    if (finePointer.matches) startPurr();
  });
  button.addEventListener("pointerleave", stopPurr);
  button.addEventListener("focus", () => {
    if (button.matches(":focus-visible")) startPurr();
  });
  button.addEventListener("blur", stopPurr);

  // Blink now and then.
  if (!reducedMotion) {
    const idleBlink = (): void => {
      if (!purring) blink(140);
      window.setTimeout(idleBlink, 2500 + Math.random() * 3500);
    };
    window.setTimeout(idleBlink, 2000);
  }
}

document.querySelectorAll<HTMLElement>("[data-pet-root]").forEach(initPet);
