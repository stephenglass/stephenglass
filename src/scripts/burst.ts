/**
 * A small emoji burst from an element's centre (stands in for the old
 * react-rewards confetti). Particles fly up and out, fall, then fade.
 */
const GRAVITY = 600;

export function burst(
  from: Element,
  emoji: string,
  { count = 12, reducedMotion = false } = {},
): void {
  const rect = from.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden";
  document.body.append(layer);

  const x0 = rect.left + rect.width / 2;
  const y0 = rect.top + rect.height / 3;
  const animations: Animation[] = [];

  for (let i = 0; i < (reducedMotion ? 1 : count); i++) {
    const particle = document.createElement("span");
    particle.textContent = emoji;
    particle.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;font-size:22px;line-height:1;translate:-50% -50%`;
    layer.append(particle);

    if (reducedMotion) {
      animations.push(
        particle.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
          duration: 1200,
        }),
      );
      continue;
    }

    const angle = ((-160 + Math.random() * 140) * Math.PI) / 180;
    const speed = 140 + Math.random() * 120;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const duration = 900 + Math.random() * 400;
    const spin = (Math.random() - 0.5) * 120;

    const frames: Keyframe[] = [0, 0.25, 0.5, 0.75, 1].map((step) => {
      const t = (step * duration) / 1000;
      const x = vx * t;
      const y = vy * t + 0.5 * GRAVITY * t * t;
      return {
        transform: `translate(${x}px, ${y}px) rotate(${spin * step}deg)`,
        opacity: step < 0.6 ? 1 : 1 - (step - 0.6) / 0.4,
      };
    });
    animations.push(particle.animate(frames, { duration, easing: "linear" }));
  }

  void Promise.allSettled(animations.map((a) => a.finished)).then(() =>
    layer.remove(),
  );
}
