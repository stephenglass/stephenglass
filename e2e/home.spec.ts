import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const links = (page: Page) =>
  page.getByRole("navigation", { name: "Links" }).getByRole("link");

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows Stephen's name and nothing else to read", async ({ page }) => {
    await expect(page).toHaveTitle("Stephen Glass");
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
  });
});
