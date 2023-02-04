import { test, expect } from "@playwright/test";

test.describe("pages/404.tsx", () => {
  test("Loads 404 page with text", async ({ page }) => {
    await page.goto("/not-found");

    expect(
      await page.waitForSelector(
        "text=/\\This is not the page you are looking for./"
      )
    ).toBeTruthy();
  });
});
