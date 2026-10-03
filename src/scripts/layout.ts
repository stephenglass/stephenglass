/**
 * The page's two layouts (see Home.astro) and where a visitor's choice is
 * kept. The inline script in Layout.astro repeats the key: keep them equal.
 */
export type LayoutName = "compact" | "full";

export const LAYOUT_KEY = "stephen.glass:layout";
