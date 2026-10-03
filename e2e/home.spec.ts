import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const game = (page: Page) => page.locator("[data-game-tile]");

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("introduces Stephen and its sections", async ({ page }) => {
    await expect(page).toHaveTitle("Stephen Glass - SWE");
    await expect(
      page.getByRole("heading", { level: 1, name: "Stephen Glass" }),
    ).toBeVisible();
    await expect(page.getByText("Software Engineer.")).toBeVisible();
    for (const name of ["Fish Catch.", "Elsewhere.", "Say hello."]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });

  test("links out from the header, Elsewhere and contact", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link")).toHaveText([
      "GitHub",
      "LinkedIn",
      "Email",
    ]);
    await expect(nav.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/stephenglass",
    );
    await expect(nav.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/stephen-glass",
    );
    await expect(
      page.getByRole("link", { name: "contact@stephen.glass" }),
    ).toHaveAttribute("href", "mailto:contact@stephen.glass");
    await expect(
      page.getByRole("link", { name: "View source" }),
    ).toHaveAttribute("href", "https://github.com/stephenglass/stephenglass");
  });

  test("shows Tonelabs by name only", async ({ page }) => {
    const link = page.getByRole("link", { name: /^Tonelabs/ });
    await expect(link).toHaveAttribute("href", "https://tonelabs.io");
    await expect(link).toHaveText(/^\s*Tonelabs\s*tonelabs\.io\s*$/);
    // Tonelabs keeps its plans private; don't describe it here.
    const html = (await page.content()).toLowerCase();
    expect(html).not.toMatch(/\b(founder|founded|studio)\b/);
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

  test("copies the email address", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Copy" }).click();
    await expect(page.getByRole("button", { name: "Copied." })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "contact@stephen.glass",
    );
  });

  test("Tony likes being petted", async ({ page }) => {
    const tony = page.getByRole("button", { name: "Pet Tony" });
    for (let i = 0; i < 15; i++) await tony.click();
    await expect(page.locator("[data-pet-count]")).toHaveText("×15");
    await expect(page.getByText("meow.")).toBeVisible();
  });

  test("plays Fish Catch: start, pause, resume", async ({ page }) => {
    await expect(game(page)).toHaveAttribute("data-phase", "idle");
    await game(page).focus();
    await page.keyboard.press("Space");
    await expect(game(page)).toHaveAttribute("data-phase", "running");
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(300);
    await page.keyboard.up("ArrowLeft");
    await page.keyboard.press("p");
    await expect(game(page)).toHaveAttribute("data-phase", "paused");
    await page.keyboard.press("Space");
    await expect(game(page)).toHaveAttribute("data-phase", "running");
    await expect(page.locator("[data-game-lives]")).toHaveText("♥♥♥");
  });

  test("taps start the game on touch screens", async ({ page, isMobile }) => {
    test.skip(!isMobile, "touch only");
    await game(page).locator("canvas").tap();
    await expect(game(page)).toHaveAttribute("data-phase", "running");
  });

  test("pauses when focus leaves the game", async ({ page }) => {
    await game(page).focus();
    await page.keyboard.press("Space");
    await expect(game(page)).toHaveAttribute("data-phase", "running");
    await page.keyboard.press("Tab");
    await expect(game(page)).toHaveAttribute("data-phase", "paused");
  });

  test("only takes the Space key while focused", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "GitHub" })
      .focus();
    await page.evaluate(() => {
      document.addEventListener("keydown", (event) =>
        setTimeout(() => {
          document.body.dataset.prevented = String(event.defaultPrevented);
        }),
      );
    });
    await page.keyboard.press("Space");
    await expect(game(page)).toHaveAttribute("data-phase", "idle");
    await expect(page.locator("body")).toHaveAttribute(
      "data-prevented",
      "false",
    );
  });

  test("tab order follows the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard order is checked on desktop");
    const names: string[] = [];
    for (let i = 0; i < 12; i++) {
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
    expect(names).toEqual([
      "Skip to content",
      "GitHub",
      "LinkedIn",
      "Email",
      "Pet Tony",
      "Fish Catch",
      "GitHub @stephenglass",
      "LinkedIn in/stephen-glass",
      "Tonelabs tonelabs.io",
      "contact@stephen.glass",
      "Copy",
      "View source",
    ]);
  });

  test("the hero light is decorative and still under reduced motion", async ({
    page,
  }) => {
    const canvas = page.locator("#main canvas[data-glass-fins]").first();
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

  test("links work and no dead controls show", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "contact@stephen.glass" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy" })).toBeHidden();
    await expect(page.locator(".game-poster")).toBeVisible();
  });
});
