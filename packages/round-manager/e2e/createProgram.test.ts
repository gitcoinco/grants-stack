import { test } from "../fixtures";
import * as metamask from "@synthetixio/synpress/commands/metamask";
import { faker } from "@faker-js/faker";
import { v4 } from "uuid";

export const abbreviateAddress = (address: string) =>
  `${address.slice(0, 8)}...${address.slice(-4)}`;

test.beforeEach(async ({ page }) => {
  // baseUrl is set in playwright.config.ts
  await page.goto("/");
});

test("create a program", async ({ page }) => {
  const programName = faker.company.name() + v4();
  await page.getByRole("navigation").getByTestId("rk-connect-button").click();
  await page.getByText("Metamask").click();
  await metamask.acceptAccess();
  await page.getByTestId("rk-chain-button").click();
  await page.getByTestId("rk-chain-option-58008").click();
  await metamask.allowToAddAndSwitchNetwork();
  await page.getByTestId("create-program").click();
  await page.getByTestId("program-name").click();
  await page.getByTestId("program-name").fill(programName);
  await page.getByTestId("save").click();
  await metamask.confirmTransaction();
  await page.getByText(programName).waitFor();
  await page.getByText(programName).click();
  await page.getByText(abbreviateAddress(metamask.walletAddress())).waitFor();
});
