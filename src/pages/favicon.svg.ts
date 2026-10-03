import type { APIRoute } from "astro";

import { faviconSvg } from "@/lib/icon";

/** The dot on a paper tile (see src/lib/icon.ts). */
export const GET: APIRoute = () =>
  new Response(faviconSvg(), { headers: { "Content-Type": "image/svg+xml" } });
