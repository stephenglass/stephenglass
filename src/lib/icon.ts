/**
 * The site icon: the dot, the full stop of "stephen.glass", as an ink square
 * centred on a paper tile. Readable on light and dark browser tabs alike.
 *
 * Pure data: shared by the favicon endpoint and the brand-asset script.
 */

export const ICON_PAPER = "#f7f6f4";
export const ICON_INK = "#16131a";

/** The icon as SVG, filling whatever box it is drawn in. */
export const faviconSvg = (): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" shape-rendering="crispEdges"><rect width="32" height="32" fill="${ICON_PAPER}"/><rect x="10" y="10" width="12" height="12" fill="${ICON_INK}"/></svg>`;
