/**
 * The page's two layouts (see Home.astro): compact and full.
 *
 * Until a visitor picks one, the screen decides (`FULL_BY_DEFAULT`): full on
 * portrait and squarish screens up to 100rem wide, where compact would float
 * in empty space, and compact on wider ones, where full's rows would run far
 * past the name. Picking Compact or Full keeps that choice in localStorage
 * under `LAYOUT_KEY`; picking Auto clears it.
 */
export const LAYOUTS = ["compact", "full"] as const;

export type LayoutName = (typeof LAYOUTS)[number];

/** The switch's options: follow the screen, or a fixed layout. */
export const LAYOUT_CHOICES = ["auto", ...LAYOUTS] as const;

export const LAYOUT_KEY = "stephen.glass:layout";

/** Media query for the screens where full is the default. */
export const FULL_BY_DEFAULT =
  "(max-aspect-ratio: 4/3) and (max-width: 100rem)";

/** The visitor's stored choice if it is one, else the screen's default. */
export const resolveLayout = (
  stored: string | null,
  fullByDefault: boolean,
): LayoutName =>
  LAYOUTS.find((layout) => layout === stored) ??
  (fullByDefault ? "full" : "compact");
