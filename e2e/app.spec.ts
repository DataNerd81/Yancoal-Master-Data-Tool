import { test, expect } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Yancoal Master Data");
});

test("health endpoint responds", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.status).toBe("healthy");
});

test("dashboard layout has navigation", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("text=Upload")).toBeVisible();
  await expect(page.locator("text=Results")).toBeVisible();
  await expect(page.locator("text=Reference Data")).toBeVisible();
});
