import { test, Page, expect } from "@playwright/test";

let page: Page;

test.beforeAll(async ({ browser }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page = await browser.newPage();

  // Click the Confirm button in the dialog that appears when the request is successful.
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/employees");
  await page.waitForSelector('[data-testid="employee-table"]');
});

test.afterAll(async () => {
  await page.close();
});

test.describe("Employee page", () => {
  test("Creating employee", async () => {
    await page.locator("text=/Create new employee/i").click();
    await expect(page).toHaveURL(/.*new/);

    await page.locator("data-testid=input-name").fill("foobar");

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/employee")),
      page.locator("input[type=submit]").click(),
    ]);

    // Make sure the updated values are reflected after the page is reloaded
    await page.reload();
    await expect(page.locator('text="foobar"')).toBeVisible();
  });

  //test.fixme("Reading employee", async () => {});
  //test.fixme("Updating employee", async () => {});
  //test.fixme("Deleting employee", async () => {});
});
