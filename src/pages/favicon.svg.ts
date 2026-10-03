import type { APIRoute } from "astro";

import { toRuns } from "@/lib/pixels";
import { PALETTE, TONY_SIT } from "@/lib/sprites";

/** Tony on a paper tile: readable on light and dark browser tabs alike. */
export const GET: APIRoute = () => {
  const rects = toRuns(TONY_SIT)
    .map(
      (run) =>
        `<rect x="${run.x + 2}" y="${run.y + 3}" width="${run.width}" height="1" fill="${PALETTE[run.key]}"/>`,
    )
    .join("");
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" shape-rendering="crispEdges"><rect width="20" height="20" fill="#f7f6f4"/>${rects}</svg>`,
    { headers: { "Content-Type": "image/svg+xml" } },
  );
};
