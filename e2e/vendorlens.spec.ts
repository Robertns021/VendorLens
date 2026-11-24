import { test, expect, type Page } from "@playwright/test";
import type { Vendor, VendorInput } from "../src/domain/models";

// Create predictable vendor data for browser tests.
function makeVendor(overrides: Partial<Vendor> = {}): Vendor {
  const now = "2026-01-01T10:00:00.000Z";

  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Northstar Cloud",
    website: "https://northstar.example",
    category: "Cloud Hosting",
    description: "A fictional cloud service provider.",
    dataClassification: "confidential",
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// Mock the vendor API so tests don't require a running backend.
async function mockVendorsApi(
  page: Page,
  initialVendors: Vendor[] = []
) {
  const vendors = [...initialVendors];

  await page.route("**/api/vendors", async (route) => {
    const method = route.request().method();

    // GET: return the current test vendors.
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ vendors }),
      });
      return;
    }

    // POST: create a vendor and retain it for subsequent GET requests.
    if (method === "POST") {
      const input = route.request().postDataJSON() as VendorInput;
      const now = new Date().toISOString();

      const vendor: Vendor = {
        ...input,
        id: "22222222-2222-4222-8222-222222222222",
        status: "active",
        createdAt: now,
        updatedAt: now,
      };

      vendors.unshift(vendor);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ vendor }),
      });
      return;
    }

    await route.fallback();
  });
}

test("dashboard loads successfully", async ({ page }) => {
  await mockVendorsApi(page, [makeVendor()]);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Risk overview" })
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Vendors" })
  ).toBeVisible();
});

test("user can create a vendor and retain it after refresh", async ({
  page,
}) => {
  await mockVendorsApi(page);

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

  // Refresh and verify that the mocked API still returns the vendor.
  await page.reload();

  await page.getByRole("button", { name: "Vendors" }).click();

  await expect(
    page.getByText("Playwright Test Vendor")
  ).toBeVisible();
});

test("user can start a vendor security assessment", async ({ page }) => {
  await mockVendorsApi(page, [makeVendor()]);

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
