/**
 * Pet Tony: every pet floats a heart and makes him wiggle. Milestones carry
 * over from the original site: a 🐀 every 10th pet, a 🐟 every 20th, a hop
 * every 20th, a spin every 30th, a "meow." every 15th and a 🐈‍⬛ burst every
 * 50th. Hovering or focusing a while makes him purr.
 */
import { burst } from "@/scripts/burst";

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const emojiFor = (n: number): string =>
  n % 20 === 0 ? "🐟" : n % 10 === 0 ? "🐀" : "❤️";

function motionFor(n: number): [Keyframe[], number] {
  if (n % 30 === 0)
    return [[{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], 700];
  if (n % 20 === 0)
    return [
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-14px)" },
        { transform: "translateY(0)" },
      ],
      600,
    ];
  return [
    [
      { transform: "rotate(0)" },
      { transform: "rotate(-4deg)" },
      { transform: "rotate(4deg)" },
      { transform: "rotate(0)" },
    ],
    300,
  ];
}

function initPet(root: HTMLElement): void {
  const button = root.querySelector<HTMLButtonElement>("[data-pet]");
  const sprite = root.querySelector<HTMLElement>("[data-pet-sprite]");
  const layer = root.querySelector<HTMLElement>("[data-pet-layer]");
  const count = root.querySelector<HTMLElement>("[data-pet-count]");
  const bubble = root.querySelector<HTMLElement>("[data-pet-bubble]");
  if (!button || !sprite || !layer || !count || !bubble) return;

  let pets = 0;
  type Frame = "sit" | "blink" | "happy";
  let mood: Frame = "sit";
  let happyTimer = 0;
  let bubbleTimer = 0;
  let purrTimer = 0;

  const show = (frame: Frame): void => {
    mood = frame;
    sprite
      .querySelectorAll<SVGElement>("[data-frame]")
      .forEach((svg) =>
        svg.toggleAttribute("data-active", svg.dataset.frame === frame),
      );
  };

  const float = (emoji: string): void => {
    const el = document.createElement("span");
    el.textContent = emoji;
    el.className = "pet-float";
    el.style.marginLeft = `${Math.round((Math.random() - 0.5) * 24)}px`;
    el.style.rotate = `${Math.round((Math.random() - 0.5) * 20)}deg`;
    if (reducedMotion) el.dataset.still = "";
    layer.append(el);
    const remove = (): void => el.remove();
    el.addEventListener("animationend", remove, { once: true });
    window.setTimeout(remove, 1500);
  };

  button.addEventListener("click", () => {
    pets += 1;
    count.hidden = false;
    count.textContent = `×${pets}`;

    float(emojiFor(pets));

    if (!reducedMotion) {
      const [frames, duration] = motionFor(pets);
      sprite.animate(frames, { duration, easing: EASE });
    }

    show("happy");
    window.clearTimeout(happyTimer);
    happyTimer = window.setTimeout(() => show("sit"), 400);

    if (pets % 15 === 0) {
      bubble.hidden = false;
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(() => (bubble.hidden = true), 1500);
    }

    if (pets % 50 === 0) burst(button, "🐈‍⬛", { reducedMotion });
  });

  // Purr after a little attention: a long hover, or keyboard focus.
  const startPurr = (): void => {
    window.clearTimeout(purrTimer);
    purrTimer = window.setTimeout(() => root.classList.add("is-purring"), 800);
  };
  const stopPurr = (): void => {
    window.clearTimeout(purrTimer);
    root.classList.remove("is-purring");
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
    const blink = (): void => {
      if (mood === "sit" && !document.hidden) {
        show("blink");
        window.setTimeout(() => mood === "blink" && show("sit"), 140);
      }
      window.setTimeout(blink, 2500 + Math.random() * 3500);
    };
    window.setTimeout(blink, 2000);
  }
}

document.querySelectorAll<HTMLElement>("[data-pet-root]").forEach(initPet);
