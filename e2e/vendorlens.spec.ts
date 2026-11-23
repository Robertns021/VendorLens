import { test, expect } from "@playwright/test";

test("dashboard loads successfully", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Risk overview" })
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Vendors" })
  ).toBeVisible();
});

test("user can create a vendor and retain it after refresh", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Vendors" }).click();

  await page.getByRole("button", { name: "Add vendor" }).click();

  await page.getByLabel("Vendor name *").fill(
    "Playwright Test Vendor"
  );

  await page.getByLabel("Website").fill(
    "https://playwright.example"
  );

  await page.getByLabel("Service category *").fill(
    "Software Testing"
  );

  await page.getByLabel("Description").fill(
    "Created during an automated browser test."
  );

  await page.getByRole("button", {
    name: "Add vendor",
    exact: true,
  }).last().click();

  await expect(
    page.getByText("Playwright Test Vendor")
  ).toBeVisible();

  // Verify that the vendor is still present after refreshing.
  await page.reload();

  await page.getByRole("button", { name: "Vendors" }).click();

  await expect(
    page.getByText("Playwright Test Vendor")
  ).toBeVisible();
});

test("user can start a vendor security assessment", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Vendors" }).click();

  await page.getByRole("button", {
    name: "Start assessment for Northstar Cloud",
  }).click();

  await expect(
    page.getByText("Security assessment")
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Northstar Cloud" })
  ).toBeVisible();

  await expect(
    page.getByText(/Multi-Factor Authentication/)
  ).toBeVisible();
});
