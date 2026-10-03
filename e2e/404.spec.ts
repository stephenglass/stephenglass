import { expect, test } from "@playwright/test";

test("unknown pages say so and lead home", async ({ page }) => {
  const response = await page.goto("/nope");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page wandered off." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
