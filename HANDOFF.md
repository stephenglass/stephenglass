# Handoff: stephen.glass

Branch `astro-redesign`. Not merged or deployed yet; `main` still has the old Preact site.

## Where things stand

The site is a single screen, "Monument" (see `CLAUDE.md` for the rules):

| Part     | Contents                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| Name     | `Stephen Glass` on one line, fitted ink edge to ink edge to a 56rem measure in pure CSS.                        |
| Links    | GitHub (`@stephenglass`), Email, Tonelabs as hairline rows.                                                     |
| Tonelabs | The one dark row: obsidian with tonelabs' dithered beams drifting very slowly.                                  |
| Tony     | A 28×28 pixel cat with dithered light, on the links' top rule at the right. Click to pet him.                   |
| Layout   | "Compact · Full" switch top right; compact is the default; the choice is remembered. Stephen hasn't picked one. |

An earlier multi-section design (glass-fins hero, Fish Catch game, alternating fields, LinkedIn) was scrapped for being too busy.

## Checks

```bash
npm run check && npm test && npm run build && npm run e2e
```

- **First e2e run:** run `npx playwright install chromium` first.
- **Base path:** `BASE_PATH=/stephenglass/ SITE_URL=https://stephenglass.github.io npm run build` produces no root-absolute URL leaks.
- **Agents and Astro:** Astro 7 backgrounds `astro dev`/`preview` when it detects an agent. Pass `--ignore-lock` to keep them in the foreground. A stale backgrounded server can keep a port and serve old CSS; `npx astro dev stop` stops it.

## Tuning the name

The fit depends on measured constants in `src/components/Home.astro`: `--k` (6.3, the ink width in em) and the `-0.027em` S bearing. `scripts/generate-brand-assets.ts` reuses them for `og.png`. Re-measure them if the font, weight or tracking changes: render with canvas `measureText` at 1000px using the page's font family and `letterSpacing`.
