import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const links = (page: Page) =>
  page.getByRole("navigation", { name: "Links" }).getByRole("link");

/**
 * Run the fake clock until the laser's first visit begins. Its timer is set
 * only once an IntersectionObserver (real time) sees the line, so keep
 * ticking rather than jumping once.
 */
const untilLaserVisits = (page: Page) =>
  expect
    .poll(async () => {
      await page.clock.runFor(1000);
      return page.locator("[data-laser]").getAttribute("data-animating");
    })
    .toBe("true");

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows Stephen's name and nothing else to read", async ({ page }) => {
    await expect(page).toHaveTitle("Stephen Glass · SWE");
    await expect(
      page.getByRole("heading", { level: 1, name: "Stephen Glass" }),
    ).toBeVisible();
    await expect(page.getByRole("heading")).toHaveCount(1);
  });

  test("links to GitHub, email and Tonelabs, in that order", async ({
    page,
  }) => {
    await expect(links(page)).toHaveCount(3);
    await expect(links(page).nth(0)).toHaveAttribute(
      "href",
      "https://github.com/stephenglass",
    );
    await expect(links(page).nth(1)).toHaveAttribute(
      "href",
      "mailto:contact@stephen.glass",
    );
    await expect(links(page).nth(2)).toHaveAttribute(
      "href",
      "https://tonelabs.io",
    );
    await expect(links(page).nth(0)).toContainText("@stephenglass");
    for (const [i, name] of ["GitHub", "Email", "Tonelabs"].entries()) {
      await expect(links(page).nth(i)).toContainText(name);
    }
  });

  test("shows Tonelabs by name only", async ({ page }) => {
    // Tonelabs keeps its plans private; don't describe it here.
    const html = (await page.content()).toLowerCase();
    expect(html).not.toMatch(/\b(founder|founded|studio|games?)\b/);
  });

  test("nothing overflows the width", async ({ page }) => {
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test("everything fits on one screen", async ({ page }) => {
    const tonelabs = await links(page).nth(2).boundingBox();
    const viewport = page.viewportSize();
    expect(tonelabs && viewport).toBeTruthy();
    if (!tonelabs || !viewport) return;
    expect(tonelabs.y + tonelabs.height).toBeLessThanOrEqual(viewport.height);
  });

  test("Tony sits on the links, at the right", async ({ page }) => {
    const tony = await page
      .getByRole("button", { name: "Pet Tony" })
      .boundingBox();
    const github = await links(page).nth(0).boundingBox();
    expect(tony && github).toBeTruthy();
    if (!tony || !github) return;
    expect(Math.abs(tony.y + tony.height - github.y)).toBeLessThanOrEqual(1);
    expect(tony.x).toBeGreaterThan(github.x + github.width / 2);
  });

  test("exposes social and icon assets", async ({ page, request }) => {
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toMatch(/^https:\/\/.+\/og\.png$/);

    for (const path of [
      "og.png",
      "favicon.svg",
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "robots.txt",
      "sitemap-index.xml",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
  });

  test("Tony likes being petted", async ({ page }) => {
    const tony = page.getByRole("button", { name: "Pet Tony" });
    for (let i = 0; i < 15; i++) await tony.click();
    await expect(page.locator("[data-pet-count]")).toHaveText("×15");
    await expect(page.getByText("meow.")).toBeVisible();
  });

  test("what rises from Tony is pixel art, kept near him", async ({ page }) => {
    const fixed = () =>
      page.evaluate(
        () =>
          [...document.body.children].filter(
            (el) => getComputedStyle(el).position === "fixed",
          ).length,
      );
    const overlays = await fixed();
    const tony = page.getByRole("button", { name: "Pet Tony" });
    const before = await tony.boundingBox();
    await tony.click();
    const layer = page.locator("[data-pet-layer]");
    await expect(layer.locator(".pet-particle svg").first()).toBeAttached();
    expect(await layer.textContent()).not.toMatch(/\p{Extended_Pictographic}/u);

    for (let i = 1; i < 50; i++) await tony.click();
    expect(await fixed()).toBe(overlays);
    await expect(layer.locator(".pet-particle")).toHaveCount(0, {
      timeout: 3000,
    });
    expect(await tony.boundingBox()).toEqual(before);
  });

  test("under reduced motion Tony stays put when petted", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.getByRole("button", { name: "Pet Tony" }).click();
    await expect(page.locator(".pet-particle")).toHaveCount(1);
    // Only the plain type may fade in; nothing travels.
    const moving = await page.evaluate(
      () =>
        document
          .querySelector("[data-pet-root]")
          ?.getAnimations({ subtree: true })
          .filter((animation) => !(animation instanceof CSSTransition)).length,
    );
    expect(moving).toBe(0);
  });

  test("a laser dot visits now and then, and Tony watches it", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("/");
    const dot = page.locator("[data-laser]");
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    await expect(dot).toHaveAttribute("data-animating", "false");

    await untilLaserVisits(page);
    await expect
      .poll(async () => {
        await page.clock.runFor(500);
        return page
          .locator("[data-pet-sprite] [data-active]")
          .getAttribute("data-frame");
      })
      .toBe("look-left");

    // The visit ends within 15s.
    await page.clock.fastForward(16_000);
    await page.clock.runFor(100);
    await expect(dot).toHaveAttribute("data-animating", "false");
  });

  test("the laser dot never goes under Tony", async ({ page }) => {
    // Every dart heads as far right as the dot may go.
    await page.addInitScript(() => (Math.random = () => 0.999));
    await page.clock.install();
    await page.goto("/");
    await untilLaserVisits(page);
    await page.clock.runFor(1000);
    const dot = await page.locator("[data-laser]").boundingBox();
    const tony = await page
      .getByRole("button", { name: "Pet Tony" })
      .boundingBox();
    expect(dot && tony).toBeTruthy();
    if (!dot || !tony) return;
    // Tony's ink starts one cell (of 28) into his box.
    const paws = tony.x + tony.width / 28;
    expect(dot.x + dot.width).toBeLessThan(paws);
    expect(dot.x + dot.width).toBeGreaterThan(paws - dot.width);
  });

  test("the laser dot keeps clear of Tony's pet count", async ({ page }) => {
    await page.addInitScript(() => (Math.random = () => 0.999));
    await page.clock.install();
    await page.goto("/");
    await page.getByRole("button", { name: "Pet Tony" }).click();
    const count = page.locator("[data-pet-count]");
    await expect(count).toHaveText("×1");
    await untilLaserVisits(page);
    await page.clock.runFor(1000);
    const dot = await page.locator("[data-laser]").boundingBox();
    const box = await count.boundingBox();
    expect(dot && box).toBeTruthy();
    if (!dot || !box) return;
    expect(dot.x + dot.width).toBeLessThan(box.x);
  });

  test("tab order follows the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard order is checked on desktop");
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab");
      names.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return (
            el?.getAttribute("aria-label") ??
            el?.innerText.replace(/\s+/g, " ").trim() ??
            ""
          );
        }),
      );
    }
    expect(names.map((name) => name.split(" ")[0])).toEqual([
      "Skip",
      "Pet",
      "GitHub",
      "Email",
      "Tonelabs",
      "Compact",
      "Full",
    ]);
  });

  test("switches between compact and full, and remembers", async ({ page }) => {
    const html = page.locator("html");
    const compact = page.getByRole("button", { name: "Compact" });
    const full = page.getByRole("button", { name: "Full" });
    await expect(html).not.toHaveAttribute("data-layout", /./);
    await expect(compact).toHaveAttribute("aria-pressed", "true");

    const nameBefore = await page.locator("h1").boundingBox();
    await full.click();
    await expect(html).toHaveAttribute("data-layout", "full");
    await expect(full).toHaveAttribute("aria-pressed", "true");
    await expect(compact).toHaveAttribute("aria-pressed", "false");
    const nameAfter = await page.locator("h1").boundingBox();
    expect(nameAfter?.y).not.toBe(nameBefore?.y);

    await page.reload();
    await expect(html).toHaveAttribute("data-layout", "full");
    await expect(full).toHaveAttribute("aria-pressed", "true");

    await compact.click();
    await page.reload();
    await expect(html).not.toHaveAttribute("data-layout", /./);
  });

  test("the Tonelabs dither is decorative and still under reduced motion", async ({
    page,
  }) => {
    const canvas = page.locator("canvas[data-dither]");
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    await expect(canvas).toHaveAttribute("data-animating", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(canvas).toHaveAttribute("data-animating", "false");
  });

  test("the laser dot stays away under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/");
    await page.clock.runFor(6000);
    await expect(page.locator("[data-laser]")).toBeHidden();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});

test.describe("Without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every link still shows; the layout switch hides", async ({ page }) => {
    await page.goto("/");
    await expect(links(page)).toHaveCount(3);
    for (const link of await links(page).all())
      await expect(link).toBeVisible();
    await expect(page.locator("[data-layout-switch]")).toBeHidden();
    await expect(page.locator("[data-laser]")).toBeHidden();
  });
});
