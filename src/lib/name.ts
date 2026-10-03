/**
 * How the name is set. It fills its measure on one line, ink edge to ink
 * edge: its font size is the measure divided by `inkEm`, the name's ink width
 * in em, and `bearingEm` pulls the S's side bearing out to the edge.
 *
 * Both are measured with the real font. If the font, weight or tracking
 * changes, re-measure them: render the name with canvas `measureText` at
 * 1000px using the page's font and `letterSpacing`.
 */
export const NAME_TYPE = {
  weight: 650,
  trackingEm: -0.04,
  lineHeight: 0.86,
  inkEm: 6.3,
  bearingEm: -0.027,
} as const;
