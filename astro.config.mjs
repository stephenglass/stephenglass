import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages: the deploy workflow sets BASE_PATH ("/" on the custom domain,
// "/<repo>/" otherwise) and SITE_URL to match. Never hard-code root-relative
// URLs; use `withBase` from src/lib/url.ts.
export default defineConfig({
  site: process.env.SITE_URL ?? "https://stephen.glass",
  base: process.env.BASE_PATH ?? "/",
  devToolbar: {
    enabled: false,
  },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Instrument Sans",
      cssVariable: "--font-instrument-sans",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            weight: "400 700",
            stretch: "75% 100%",
            style: "normal",
            src: ["./src/assets/fonts/InstrumentSans-Variable.woff2"],
          },
        ],
      },
    },
  ],
});
