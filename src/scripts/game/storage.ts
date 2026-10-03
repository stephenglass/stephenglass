/** Best score, kept in localStorage when it is available. */
const KEY = "tony-run:best";
let memory = 0;

export function getBest(): number {
  try {
    const stored = Number(localStorage.getItem(KEY));
    if (Number.isFinite(stored) && stored > memory) memory = stored;
  } catch {
    // Storage blocked (private mode, settings): keep it for this visit.
  }
  return memory;
}

export function setBest(value: number): void {
  memory = Math.max(memory, value);
  try {
    localStorage.setItem(KEY, String(memory));
  } catch {
    // See above.
  }
}
