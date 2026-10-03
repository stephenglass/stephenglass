/**
 * The page's two layouts (see Home.astro): compact, the default, and full.
 * A visitor's choice is kept in localStorage under `LAYOUT_KEY`.
 */
export const LAYOUTS = ["compact", "full"] as const;

export type LayoutName = (typeof LAYOUTS)[number];

export const LAYOUT_KEY = "stephen.glass:layout";
