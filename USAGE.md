# My personal landing page

This repository is the source for my [personal landing page](https://stephen.glass). It's a static [Astro](https://astro.build/) site styled with [Tailwind CSS](https://tailwindcss.com/), deployed to GitHub Pages.

- `npm run dev` - Starts a dev server at <http://localhost:4321/>
- `npm run build` - Builds for production, emitting to `dist/`
- `npm run preview` - Serves the production build at <http://localhost:4321/>
- `npm run check` - Type-checks the project (`astro check`)
- `npm test` - Unit tests for the pure helpers in `src/lib`
- `npm run e2e` - Playwright end-to-end and accessibility tests (first run: `npx playwright install chromium`)
- `npm run brand:assets` - Regenerates the favicon PNG, touch icon and `og.png` in `public/`

## Deploying

Pushing to `main` builds and deploys with `.github/workflows/deploy.yml`. Set the repository variable `PAGES_CUSTOM_DOMAIN=true` when the site is served from the custom domain; otherwise it builds for `https://<owner>.github.io/<repo>/`.

To preview a project-path build locally:

```bash
BASE_PATH=/stephenglass/ SITE_URL=https://stephenglass.github.io npm run build
npm run preview  # then open http://localhost:4321/stephenglass/
```
