import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { TONY_COLS, TONY_PAWS_COL } from "../src/lib/sprites.ts";

const links = (page: Page) =>
  page.getByRole("navigation", { name: "Links" }).getByRole("link");
const tony = (page: Page) => page.getByRole("button", { name: "Pet Tony" });
const laser = (page: Page) => page.locator("[data-laser]");

/**
 * Run the fake clock until the laser's first visit begins. Its timer is set
 * only once an IntersectionObserver (real time) sees the line, so keep
 * ticking rather than jumping once.
 */
const untilLaserVisits = (page: Page) =>
  expect
    .poll(async () => {
      await page.clock.runFor(1000);
      return laser(page).getAttribute("data-animating");
    })
    .toBe("true");

/** Load the page with every dart heading as far right as the dot may go. */
const gotoWithLaserFarRight = async (page: Page) => {
  await page.addInitScript(() => (Math.random = () => 0.999));
  await page.goto("/");
};

const box = async (locator: Locator) => {
  const result = await locator.boundingBox();
  expect(result).toBeTruthy();
  return result ?? { x: 0, y: 0, width: 0, height: 0 };
};

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
    for (const [i, [name, href]] of (
      [
        ["GitHub", "https://github.com/stephenglass"],
        ["Email", "mailto:contact@stephen.glass"],
        ["Tonelabs", "https://tonelabs.io"],
      ] as const
    ).entries()) {
      await expect(links(page).nth(i)).toContainText(name);
      await expect(links(page).nth(i)).toHaveAttribute("href", href);
    }
    await expect(links(page).nth(0)).toContainText("@stephenglass");
  });

  test("shows Tonelabs by name only", async ({ page }) => {
    // Tonelabs keeps its plans private; don't describe it here.
    const html = (await page.content()).toLowerCase();
    expect(html).not.toMatch(/\b(founder|founded|studio|games?)\b/);
  });

  test("shows each link's destination, down to 320px wide", async ({
    page,
  }) => {
    for (const width of [page.viewportSize()?.width ?? 0, 320]) {
      await page.setViewportSize({ width, height: 800 });
      for (const [i, detail] of [
        "@stephenglass",
        "contact@stephen.glass",
        "tonelabs.io",
      ].entries())
        await expect(links(page).nth(i).getByText(detail)).toBeVisible();
      const label = await box(links(page).nth(1).getByText("Email"));
      const destination = await box(
        links(page).nth(1).getByText("contact@stephen.glass"),
      );
      // Laid out beside the label, not just kept for screen readers (1px).
      expect(destination.width).toBeGreaterThan(100);
      expect(destination.x).toBeGreaterThan(label.x + label.width);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
  });

  test("nothing overflows the width", async ({ page }) => {
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test("everything fits on one screen", async ({ page }) => {
    const tonelabs = await box(links(page).nth(2));
    expect(tonelabs.y + tonelabs.height).toBeLessThanOrEqual(
      page.viewportSize()?.height ?? 0,
    );
  });

  test("Tony sits on the links, at the right", async ({ page }) => {
    const cat = await box(tony(page));
    const github = await box(links(page).nth(0));
    expect(Math.abs(cat.y + cat.height - github.y)).toBeLessThanOrEqual(1);
    expect(cat.x).toBeGreaterThan(github.x + github.width / 2);
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
    for (let i = 0; i < 15; i++) await tony(page).click();
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
    const before = await tony(page).boundingBox();
    await tony(page).click();
    const layer = page.locator("[data-pet-layer]");
    await expect(layer.locator(".pet-particle svg").first()).toBeAttached();
    expect(await layer.textContent()).not.toMatch(/\p{Extended_Pictographic}/u);

    for (let i = 1; i < 50; i++) await tony(page).click();
    expect(await fixed()).toBe(overlays);
    await expect(layer.locator(".pet-particle")).toHaveCount(0, {
      timeout: 3000,
    });
    expect(await tony(page).boundingBox()).toEqual(before);
  });

  test("tab order follows the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard order is checked on desktop");
    const names: string[] = [];
    for (let i = 0; i < 8; i++) {
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
      "Auto",
      "Compact",
      "Full",
    ]);
  });

  test("on auto, full on portrait and squarish screens, compact on wide ones", async ({
    page,
  }) => {
    const html = page.locator("html");
    const auto = page.getByRole("button", { name: "Auto" });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(auto).toHaveAttribute("aria-pressed", "true");
    await expect(html).toHaveAttribute("data-layout", "compact");

    // Auto follows the screen as it changes shape.
    await page.setViewportSize({ width: 1200, height: 1000 });
    await expect(html).toHaveAttribute("data-layout", "full");

    // Squarish but past 100rem: full's rows would run far past the name.
    await page.setViewportSize({ width: 1700, height: 1400 });
    await expect(html).toHaveAttribute("data-layout", "compact");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(auto).toHaveAttribute("aria-pressed", "true");
    await expect(html).toHaveAttribute("data-layout", "full");
    const tonelabs = await box(links(page).nth(2));
    expect(844 - (tonelabs.y + tonelabs.height)).toBeLessThan(48);
  });

  test("switches layouts, remembers, and goes back to auto", async ({
    page,
  }) => {
    const html = page.locator("html");
    const button = (name: string) =>
      page.getByRole("button", { name, exact: true });
    const pressed = (name: string) =>
      expect(button(name)).toHaveAttribute("aria-pressed", "true");
    const initial = (await html.getAttribute("data-layout")) ?? "";
    // Pick the layout auto didn't.
    const [other, Other] =
      initial === "full" ? ["compact", "Compact"] : ["full", "Full"];
    await pressed("Auto");

    const nameBefore = await page.locator("h1").boundingBox();
    await button(Other).click();
    await expect(html).toHaveAttribute("data-layout", other);
    await pressed(Other);
    await expect(button("Auto")).toHaveAttribute("aria-pressed", "false");
    const nameAfter = await page.locator("h1").boundingBox();
    expect(nameAfter?.y).not.toBe(nameBefore?.y);

    await page.reload();
    await expect(html).toHaveAttribute("data-layout", other);
    await pressed(Other);

    // A choice holds when the screen changes shape.
    const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
    await page.setViewportSize({ width: height, height: width });
    await expect(html).toHaveAttribute("data-layout", other);
    await page.setViewportSize({ width, height });

    await button("Auto").click();
    await expect(html).toHaveAttribute("data-layout", initial);
    await page.reload();
    await expect(html).toHaveAttribute("data-layout", initial);
    await pressed("Auto");
  });

  test("the Tonelabs dither is decorative and drifts", async ({ page }) => {
    const canvas = page.locator("canvas[data-dither]");
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    await expect(canvas).toHaveAttribute("data-animating", "true");
  });
});

test.describe("Under reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Tony stays put when petted", async ({ page }) => {
    await tony(page).click();
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

  test("the Tonelabs dither holds still", async ({ page }) => {
    await expect(page.locator("canvas[data-dither]")).toHaveAttribute(
      "data-animating",
      "false",
    );
  });

  test("has no serious accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});

test.describe("Laser dot", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test("visits now and then, and Tony watches it", async ({ page }) => {
    await page.goto("/");
    await expect(laser(page)).toHaveAttribute("aria-hidden", "true");
    await expect(laser(page)).toHaveAttribute("data-animating", "false");

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
    await expect(laser(page)).toHaveAttribute("data-animating", "false");
  });

  test("never goes under Tony", async ({ page }) => {
    await gotoWithLaserFarRight(page);
    await untilLaserVisits(page);
    await page.clock.runFor(1000);
    const dot = await box(laser(page));
    const cat = await box(tony(page));
    const paws = cat.x + (cat.width * TONY_PAWS_COL) / TONY_COLS;
    expect(dot.x + dot.width).toBeLessThan(paws);
    expect(dot.x + dot.width).toBeGreaterThan(paws - dot.width);
  });

  test("keeps clear of Tony's pet count", async ({ page }) => {
    await gotoWithLaserFarRight(page);
    await tony(page).click();
    const count = page.locator("[data-pet-count]");
    await expect(count).toHaveText("×1");
    await untilLaserVisits(page);
    await page.clock.runFor(1000);
    const dot = await box(laser(page));
    expect(dot.x + dot.width).toBeLessThan((await box(count)).x);
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("stays away", async ({ page }) => {
      await page.goto("/");
      await page.clock.runFor(6000);
      await expect(laser(page)).toBeHidden();
    });
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
    await expect(laser(page)).toBeHidden();
  });
});
