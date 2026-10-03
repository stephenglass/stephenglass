# Handoff: stephen.glass redesign

Branch `astro-redesign`. The work is committed but **not merged or deployed**. `main` still has the old Preact site.

## Where things stand

The site has been rewritten from Preact/Vite into **Astro 7 + Tailwind 4 + TypeScript**, as a static site deployed to GitHub Pages. It follows the design philosophy of the sister site tonelabs.io (`~/Projects/tonelabs/apps/tonelabs`) but has its own identity.

The page is a single scroll with fields that alternate like tonelabs:

| Section          | Field    | Contents                                                                                                                                                        |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero             | obsidian | Lowercase `stephen glass` / `software engineer.` with a slow blur-in. **Glass fins** background. Pet-Tony in the corner. Header nav: GitHub · LinkedIn · Email. |
| Fish Catch       | paper    | Label "Inspired by Tonelabs". Tony's aquarium mini-game (catch fish, dodge starfish). The tank has no frame and its edges are softly faded.                     |
| Elsewhere        | obsidian | GitHub, LinkedIn and Tonelabs link rows.                                                                                                                        |
| Contact + footer | paper    | The email shown large, a Copy button, © and "View source".                                                                                                      |

## Checks

All green at handoff. The pre-commit hook runs `prettier:check` and `check`.

```bash
npm run check && npm test && npm run build && npm run e2e
```

| Check         | Result at handoff                                                      |
| ------------- | ---------------------------------------------------------------------- |
| `astro check` | 0 errors                                                               |
| `npm test`    | 5 game-engine unit tests pass (`node --test`)                          |
| `npm run e2e` | 28 pass, 2 intentionally skipped (Playwright + axe; desktop + Pixel 7) |

- **First e2e run:** run `npx playwright install chromium` first.
- **Base path:** `BASE_PATH=/stephenglass/ SITE_URL=https://stephenglass.github.io npm run build` produces no root-absolute URL leaks.
- **Agents and Astro:** Astro 7 backgrounds `astro dev`/`preview` when it detects an agent. Pass `--ignore-lock` to keep them in the foreground; `playwright.config.ts` already does. `npx astro dev stop` stops a backgrounded one.

## Design rules

`CLAUDE.md` has the details. Memory has the history of the user's preferences.

- **Shared with tonelabs:**
  - Solid fields; no gradients, shadows or radii. The 404's pill button is the only exception.
  - Hairline frames.
  - Instrument Sans everywhere, on tonelabs' type scale. No monospace.
  - Short copy ending in periods.
  - 8×8 pixel glyphs, always with a label.
  - Motion limited to quiet colour and underline transitions.
- **Our own:**
  - Aqua accent (sea glass in the hero fins), not amber.
  - Glass-fins hero.
  - Tony, a plain neutral black pixel cat.
  - Lowercase hero type.
  - No theme toggle.
- **Never:**
  - Cursor-chasing effects.
  - Busy or bright backgrounds.
  - Rounded cards.
  - Cutesy Tony.
  - Describing Tonelabs beyond its name ("founder", "studio" and games are banned; an e2e test guards this).
- **Hero background history:** many directions were tried and rejected (listed in `CLAUDE.md`). The winner came from the user's brief: _"take the design of the tonelabs header but glassify it."_ Keep it quiet: muted colour, very slow motion, wide gaps.
- **How the user likes to work:** show stills/videos or a temporary `/lab` page on the dev server before building, then iterate in small steps.

## Key files

| Area            | Files                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page            | `src/pages/index.astro`, `src/components/sections/{Hero,FishCatch,Elsewhere,Contact}.astro`, `src/layouts/Layout.astro` (SEO, OG, JSON-LD, skip link)               |
| Hero background | `src/components/GlassFins.astro`, `src/scripts/hero/glass-fins.ts` (WebGL2 shader), `src/scripts/hero/loop.ts` (pause offscreen / reduced motion)                   |
| Tony            | `src/lib/sprites.ts` (pixel art), `src/components/PetTony.astro`, `src/scripts/pet.ts`, `src/scripts/burst.ts`                                                      |
| Game            | `src/scripts/game/` (`engine.ts` is pure and unit-tested; `render.ts` draws the aquarium; `index.ts` handles DOM and input)                                         |
| Content         | `src/data/site.ts` (name, role, links, theme colour)                                                                                                                |
| Styles          | `src/styles/global.css` (the only CSS entry)                                                                                                                        |
| Brand assets    | `scripts/generate-brand-assets.ts` → `public/og.png`, `favicon-32x32.png`, `apple-touch-icon.png`. Re-run `npm run brand:assets` after changing name, role or Tony. |
| Deploy          | `.github/workflows/deploy.yml` (Node 24; check + test before build)                                                                                                 |

## Next steps / open items

1. **Review and merge:** open a PR from `astro-redesign` to `main`. Nothing has been pushed yet.
2. **Before the first deploy:**
   - Set the repo variable `PAGES_CUSTOM_DOMAIN=true`, or the build targets `/<repo>/` instead of stephen.glass.
   - Check that the Pages custom domain is still `stephen.glass`.
3. **After deploying:**
   - Check link previews with LinkedIn Post Inspector or opengraph.xyz.
   - Tap-test Fish Catch and pet-Tony on an iPhone.
   - Run Lighthouse (targets: a11y, best practices and SEO = 100; perf ≥ 95).
4. **Accent consistency:** the hero fringe is sea glass and the rest of the site uses aqua, which are close. The user previewed amber and lilac for the fins but chose sea glass. If the accent ever changes, change it site-wide (`--color-aqua*` in `global.css`, `SEA_GLASS` in `glass-fins.ts`).
5. **README.md** is the GitHub _profile_ README and was deliberately left untouched.
6. **Possible polish, not requested:**
   - A mobile "expand" mode for Fish Catch.
   - Sound is deliberately absent.
