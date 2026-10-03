# stephen.glass

Personal landing page: a static Astro 7 site (Tailwind 4, TypeScript strict), deployed to GitHub Pages. See `USAGE.md` for commands.

## Design: "Monument"

One screen of paper and ink. Simple and clean: the impression comes from type, scale and alignment, not effects.

- **The name** (`Stephen Glass`, no title or role) is set on one line and fills a 56rem measure (or the screen, if narrower), ink edge to ink edge. It is Instrument Sans at weight 650, tracking −0.04em, line-height 0.86. It is fitted in pure CSS: `font-size: min(100cqw, 56rem) / --k`, where `--k` = 6.3 is the measured ink width in em. If the font, weight or tracking changes, re-measure `--k` and the `-0.027em` bearing.
- **Two layouts, switchable top right** ("Compact · Full", `LayoutSwitch.astro`). Compact (the default) groups the name and links in a centred column; full puts the name at the top and the links at the bottom of the screen. The choice goes in `html[data-layout]`, is remembered in localStorage, and is applied before paint by an inline script in `Layout.astro`. Stephen likes both, so keep both until he decides.
- **Tony** (a black 28×28 pixel cat with light eyes, softly rounded ears and head) sits on the links' top rule at the right, out of the way. He is lit from the top right in ordered-dither grey (`withLight` → `TONY_LIT_*` in `src/lib/sprites.ts`), matching the Tonelabs row. He scales by whole pixels. The 16×15 classic Tony remains for the favicon and the 404. He stays neutral, not cutesy. He means a lot to Stephen, so keep him.
- **Petting Tony** (`src/scripts/pet.ts`) speaks the page's language. Each pet he shuts his eyes in a ^, hops one cell, and a pixel heart rises and dissolves. Every 20th pet a fish rises with a 3-cell hop, every 30th he flicks an ear, every 15th he says "meow.", and every 50th a small flight of hearts rises. A long hover or focus makes him purr: "prrr" and slow blinks. The pet count (`×N`) rests on the rule to his left.
  - Everything he emits is a sprite in `sprites.ts` (`HEART`, `FISH`), drawn on his grid (`--tony-cell`) and lit like him with `withLight`. Hearts are rose pink (distinct from the laser's red) and the fish is slate blue.
  - Motion snaps to whole cells (`steps()`): no rotation, scaling or sub-pixel shifts.
  - Particles disappear by dissolving through Bayer stages (`dissolve`, `DISSOLVE_STAGES`), not by an opacity fade.
  - Text is plain Instrument Sans in `ink-dim`, with no box or bubble.
  - Nothing goes full-screen. No emoji.
- **The laser dot** (`LaserDot.astro` + `src/lib/laser.ts`): a 5×5 red pixel dot with a dithered halo visits Tony's line now and then. It appears ~3s after load, darts, creeps and trembles for 10–15s, then is gone for 30–60s. It stays to Tony's left and never goes under him: its travel stops 2 cells short of his paws, or of his pet count once it shows. Tony's eyes follow it: he looks a pixel left when it's far off, and ahead (down at it) when it's near his paws (`tony:gaze` event → the `look-left` frame in `pet.ts`). It moves on its own and never reacts to the pointer. It pauses offscreen or in a hidden tab, and it never shows under reduced motion or without JS.
- **Three link rows:** GitHub, Email, Tonelabs. They are separated by hairlines (`ink/10`), with a large label on the left and the destination plus ↗ on the right (just ↗ on phones). Hover shows only an underline and colour change, 300ms `ease-out-soft`.
- **Tonelabs is the one dark row:** obsidian, with tonelabs' 1-bit Bayer beams in bone drifting very slowly behind it (`TonelabsDither.astro` + `src/lib/dither.ts`, ported from `~/Projects/tonelabs/apps/tonelabs`). It is masked away from the label and address. It is the only decoration on the page.
- **Colours:** paper `#f7f6f4`, ink `#16131a`, ink-dim. Obsidian and bone appear only in the Tonelabs row. There is no accent colour besides the laser dot's red (and the pink and blue of Tony's particles), and no theme toggle (light only); the layout switch is the only page control.
- **Never:**
  - fancy effects or animation beyond the Tonelabs drift, Tony's petting and the laser dot's visits;
  - cursor-chasing effects (things that follow or react to the pointer, eyes that track it);
  - gradients, shadows, rounded cards;
  - monospace;
  - a header or footer.
- **Tonelabs:** show it by name only. Never say "founder", "studio" or games; e2e guards this.

## Layout

```
src/
├── pages/            index (renders Home), 404, favicon.svg + robots.txt endpoints
├── layouts/          Layout.astro: head/SEO, skip link, <main>, console egg
├── components/       Home (the page body), LaserDot, LayoutSwitch, PetTony, PixelSprite, TonelabsDither
├── assets/           Instrument Sans (OFL)
├── lib/              pure data/helpers: pixels, sprites (Tony, laser), laser (motion, gaze), bayer, dither, url
├── scripts/          client scripts: pet, console, layout (switch key)
├── data/site.ts      name, links, theme colour (single source)
└── styles/global.css the only CSS entry: tokens and utilities
scripts/generate-brand-assets.ts   favicon PNG, touch icon, og.png (commit outputs in public/)
e2e/                  Playwright + axe
```

## Rules

- **Base path.** The site may be served under `/<repo>/`. Never hard-code root-relative URLs; use `withBase()` / `absoluteUrl()` from `src/lib/url.ts`.
- **Ambient motion.** The Tonelabs dither and the laser dot pause offscreen or in a hidden tab and never react to the pointer. Under `prefers-reduced-motion` the dither shows a still frame and the laser never appears.
- **Pure lib.** Keep `src/lib/*` DOM-free with erasable TS, because the brand-asset script and `node --test` import it directly.
- **No JS** must still show every link. JS-only controls start `hidden`.
- **Astro and agents.** `astro dev`/`preview` background themselves when run by an agent. Pass `--ignore-lock` to keep them in the foreground; Playwright's web server does this (port 4322).

## Checks

`npm run check && npm test && npm run build && npm run e2e` (pre-commit runs prettier:check + check).
