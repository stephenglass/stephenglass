# stephen.glass

Personal landing page: a static Astro 7 site (Tailwind 4, TypeScript strict), deployed to GitHub Pages. `README.md` is Stephen's GitHub profile README; the project docs and commands are in `USAGE.md`.

## Design

One screen of paper and ink. The impression comes from type, scale and alignment, not effects.

- **The name** (`Stephen Glass`, no title or role) sits on one line and fills a 56rem measure (or the screen, if narrower), ink edge to ink edge, in pure CSS. Its type settings and measured constants are in `src/lib/name.ts`, shared with the `og.png` generator; re-measure them if the font, weight or tracking changes.
- **Two layouts** ("Auto · Compact · Full", top right, `LayoutSwitch.astro`). Compact groups the name and links in a centred column. Full puts the name at the top and the links at the bottom. Auto, the default, follows the screen (`FULL_BY_DEFAULT` in `src/lib/layout.ts`): full on portrait and squarish screens (up to 4:3) up to 100rem wide, compact on wider ones, where full's rows would run far past the name. It updates as the screen rotates or resizes. Picking Compact or Full stores the choice in localStorage, and Auto clears it. An inline script in `Layout.astro` sets `html[data-layout]` before paint.
- **Three link rows:** GitHub, Email, Tonelabs. They have hairline separators (`ink/10`), a large label on the left, and the destination plus ↗ on the right (just ↗ on phones). Hover shows only an underline and a colour change (`underline-soft`).
- **Tonelabs is the one dark row:** obsidian, with tonelabs' 1-bit Bayer beams in bone drifting very slowly behind it, masked away from the text. It is the only decoration on the page. Show Tonelabs by name only; never say "founder", "studio" or games (e2e guards this).
- **Tony,** a black 28×28 pixel cat lit from the top right in ordered-dither grey, sits on the links' top rule at the right. He scales by whole pixels and stays neutral, never cutesy. A small 16×15 Tony sleeps on the 404. He stays.
- **Petting Tony** (`src/scripts/pet.ts`; milestones in `src/lib/petting.ts`) speaks the page's language:
  - Everything he emits is a sprite in `sprites.ts`, drawn on his grid (`--tony-cell`) and lit like him.
  - Motion snaps to whole cells with `steps()`: no rotation, scaling or sub-pixel shifts.
  - Particles leave by dissolving through Bayer stages, not by fading.
  - Text is plain type in `ink-dim`, with no bubble.
  - Nothing goes full-screen. No emoji.
- **The laser dot** (`LaserDot.astro`, `src/scripts/laser-dot.ts`, `src/lib/laser.ts`) visits Tony's line now and then while his eyes follow it (`tony:gaze` event). It stays to his left, short of his paws and his pet count, and it moves on its own, never reacting to the pointer.
- **Colours:** paper, ink and ink-dim (`src/lib/palette.ts`, mirrored in `global.css`). Obsidian and bone appear only in the Tonelabs row. The only other colours are the laser's red and the pink and blue of Tony's particles. Light only.
- **Favicon:** the dot, an ink square on a paper tile (`src/lib/icon.ts`). No cat.
- **Never:**
  - effects or animation beyond the Tonelabs drift, petting Tony and the laser dot;
  - cursor-chasing (anything that follows or reacts to the pointer);
  - gradients, shadows or rounded cards;
  - monospace;
  - a header or footer.

## Layout

```
src/
├── pages/       index, 404, favicon.svg and robots.txt endpoints
├── layouts/     Layout.astro: head/SEO, pre-paint layout script, skip link, <main>
├── components/  Home (the page body), LayoutSwitch, PetTony, LaserDot, TonelabsDither, PixelSprite
├── lib/         pure data and helpers: palette, name, layout, pixels, bayer, sprites, petting, laser, dither, icon, url
├── scripts/     client scripts: pet, laser-dot, tonelabs-dither, motion (shared), console
├── data/site.ts name, title, link URLs (single source)
└── styles/global.css  the only CSS entry: tokens and utilities
scripts/generate-brand-assets.ts  favicon PNG, touch icon and og.png (commit the outputs in public/)
e2e/             Playwright + axe
```

## Rules

- **Base path.** The site may be served under `/<repo>/`. Never hard-code root-relative URLs; use `withBase()` / `absoluteUrl()` from `src/lib/url.ts`.
- **Ambient motion.** The Tonelabs dither and the laser dot pause offscreen or in a hidden tab (`whileOnScreen`). Under `prefers-reduced-motion` the dither shows a still frame and the laser never appears.
- **Pure lib.** Keep `src/lib/*` DOM-free with erasable TS and relative `.ts` imports, because `node --test` and the brand-asset script import it directly (`url.ts` is the exception: it reads `import.meta.env`). Client scripts must not import `sprites.ts` at runtime (type imports are fine); pass sprite measurements through markup.
- **No JS** must still show every link. JS-only controls start `hidden`.
- **Astro and agents.** `astro dev`/`preview` background themselves when run by an agent. Pass `--ignore-lock` to keep them in the foreground (Playwright's web server does, on port 4322). A stale background server can hold a port and serve old CSS; stop it with `npx astro dev stop`.

## Checks

`npm run check && npm test && npm run build && npm run e2e` (pre-commit runs `prettier:check` and `check`; CI runs all of them on pull requests).
