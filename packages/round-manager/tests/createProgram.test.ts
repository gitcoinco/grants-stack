import { test } from "../fixtures";
import * as metamask from "@synthetixio/synpress/commands/metamask";

test.beforeEach(async ({ page }) => {
  // baseUrl is set in playwright.config.ts
  await page.goto("/");
});

test("create a program", async ({ page }) => {
  await page.getByRole("navigation").getByTestId("rk-connect-button").click();
  await page.getByText("Metamask").click();
  await metamask.acceptAccess();
  await page.getByTestId("rk-chain-button").click();
  await page.getByTestId("rk-chain-option-58008").click();
  await metamask.allowToAddAndSwitchNetwork();
  await page.getByTestId("create-program").click();
  await page.getByTestId("program-name").click();
  await page.getByTestId("program-name").fill("Testing from Playwright");
  await page.getByTestId("save").click();
  await metamask.confirmTransaction();
  await page.getByText("Testing from Playwright").waitFor();
});
