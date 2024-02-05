import { test } from "../fixtures";
import * as metamask from "@synthetixio/synpress/commands/metamask";

test.beforeEach(async ({ page }) => {
  // baseUrl is set in playwright.config.ts
  await page.goto("/");
});

test("main page loads and wallet connects", async ({ page }) => {
  await page.getByRole("navigation").getByTestId("rk-connect-button").click();
  await page.getByText("Metamask").click();
  await metamask.acceptAccess();
  await page.getByText("My Programs").waitFor();
});
