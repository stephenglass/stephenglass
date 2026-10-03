/** Motion helpers shared by the client scripts. */

export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/**
 * Calls `onChange(true)` when `element` is on screen in a visible tab, and
 * `onChange(false)` when either stops being true, so motion can pause.
 */
export function whileOnScreen(
  element: Element,
  onChange: (active: boolean) => void,
): void {
  let visible = false;
  let active = false;
  const update = (): void => {
    const next = visible && !document.hidden;
    if (next === active) return;
    active = next;
    onChange(active);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    update();
  }).observe(element);
  document.addEventListener("visibilitychange", update);
}

/** The size of one of Tony's cells in CSS pixels (`--tony-cell`). */
export const tonyCell = (element: Element): number =>
  parseFloat(getComputedStyle(element).getPropertyValue("--tony-cell")) || 3;
