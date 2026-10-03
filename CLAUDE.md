# stephen.glass

Personal landing page: a static Astro 7 site (Tailwind 4, TypeScript strict), deployed to GitHub Pages. See `USAGE.md` for commands.

## Design: tonelabs' philosophy, its own identity

The sister site tonelabs.io (`~/Projects/tonelabs/apps/tonelabs`) sets the philosophy; this site must still look like itself.

- **Shared:**
  - Solid fields with no gradients, no shadows and no rounded corners. The 404's pill button is the only exception.
  - Hairline frames (`ink/10`, `white/10`).
  - Instrument Sans everywhere on tonelabs' scale: body 1.1875rem at weight 450; headings weight 650 at −0.04em, sized with `clamp()`. No monospace.
  - Short declarative copy that ends with a period.
  - 8×8 pixel glyphs, always beside a text label.
  - Motion is limited to colour and underline transitions (300ms `ease-out-soft`).
- **Ours:**
  - Fields alternate like tonelabs: Hero (obsidian) → Fish Catch (paper) → Elsewhere (obsidian) → Contact + footer (paper). The Fish Catch tank has no frame; its edges soften slightly into the paper.
  - The accent is aqua (`aqua` for decoration, `aqua-ink` for text), never amber.
  - The hero name and subline are set lowercase via CSS (`stephen glass` / `software engineer.`), Instrument Sans semibold at about 85% width. The real text stays proper case for SEO and screen readers. The self-hosted variable font carries the `wdth` axis.
  - **Hero background: "glass fins"** (`GlassFins.astro` + `src/scripts/hero/glass-fins.ts`). Tonelabs' beams rebuilt in glass: 5 wide fins with gaps, crisp edges plus an inner line, faint frost, refraction, and a thin muted sea-glass fringe. Very slow motion. 1-bit Bayer, bone on obsidian. Keep it quiet: low brightness, low motion.
  - Rejected hero ideas (don't retry them): smooth Beams, a glass slab or prism over beams, Liquid Glass panes or cubes over beams, Paper Shaders presets, caustics, Atkinson ripples, Moonglow, contour lines, cursor dot fields. Also rejected: a hero-echo "sliver" in Fish Catch.
  - Tony, a plain black pixel cat with light eyes, is the motif. Keep him neutral, not cutesy.
- **Never:**
  - Cursor-chasing effects: things that follow or react to the pointer across the page, or eyes that track it.
  - Cards with radii or lifts.
  - A theme toggle. The fields are fixed.
- **Tonelabs:** show it by name only. Never say "founder", "studio" or games; e2e guards this.

## Layout

```
src/
├── pages/            index (Hero, FishCatch, Elsewhere, Contact), 404, favicon.svg + robots.txt endpoints
├── layouts/          Layout.astro: head/SEO, skip link, SiteHeader, <main>, SiteFooter, console egg
├── components/       SiteHeader, SiteFooter, GlassFins, PetTony, PixelGlyph, PixelSprite
│   └── sections/     Hero, FishCatch, Elsewhere, Contact
├── assets/           Instrument Sans (OFL)
├── lib/              pure data/helpers: pixels, sprites (Tony), glyphs (8×8), bayer, url
├── scripts/          client scripts: hero/ (glass-fins WebGL2, ambient loop), pet, burst, console
│   └── game/         Fish Catch: engine.ts (pure, unit-tested), render, index (DOM/input), storage
├── data/site.ts      name, role, links, theme colour (single source)
└── styles/global.css the only CSS entry: tokens and utilities
scripts/generate-brand-assets.ts   favicon PNG, touch icon, og.png (commit outputs in public/)
e2e/                  Playwright + axe
```

## Rules

- **Base path.** The site may be served under `/<repo>/`. Never hard-code root-relative URLs; use `withBase()` / `absoluteUrl()` from `src/lib/url.ts`.
- **Ambient motion.** Decorative motion (glass fins, aquarium scenery) is paused offscreen or when the tab is hidden, and shows a still frame under `prefers-reduced-motion`.
- **Pixel art** lives in `src/lib/sprites.ts` / `glyphs.ts` as character rows. Keep those files DOM-free with erasable TS, because the brand-asset script and `node --test` import them directly.
- **No JS** must still show every link. JS-only controls start `hidden`.
- **Astro and agents.** `astro dev`/`preview` background themselves when run by an agent. Pass `--ignore-lock` to keep them in the foreground; Playwright's web server does this.

## Checks

`npm run check && npm test && npm run build && npm run e2e` (pre-commit runs prettier:check + check).
