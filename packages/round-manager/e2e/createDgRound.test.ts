import { test } from "../fixtures";
import * as metamask from "@synthetixio/synpress/commands/metamask";
import { faker } from "@faker-js/faker";
import { v4 } from "uuid";

test.beforeEach(async ({ page }) => {
  // baseUrl is set in playwright.config.ts
  await page.goto("/");
});

test("connect wallet, create a program, create a dg round", async ({
  page,
}) => {
  const roundName = faker.company.name() + v4();
  await page.getByRole("navigation").getByTestId("rk-connect-button").click();
  await page.getByText("Metamask").click();
  await metamask.acceptAccess();
  await page
    .getByRole("link", { name: "GS Optimism Program 10 Round" })
    .click();
  await page.getByTestId("create-round-small-link").click();
  await page.getByRole("button", { name: "Direct Grants Choose this" }).click();
  await page.getByRole("button", { name: "Create round" }).click();
  await page.getByLabel("Round Name").click();
  await page.getByLabel("Round Name").fill(roundName);
  await page.getByTestId("support-type-select").click();
  await page.getByRole("option", { name: "Email" }).locator("div").click();
  await page.getByPlaceholder("Enter desired form of contact").click();
  await page
    .getByPlaceholder("Enter desired form of contact")
    .fill("test@test.com");
  await page.getByLabel("Start Date").click();
  await page.getByRole("cell", { name: "›" }).locator("span").click();
  await page.getByRole("cell", { name: "›" }).locator("span").click();
  await page.getByRole("cell", { name: "14" }).click();
  await page.getByLabel("This round does not have an").check();
  await page.getByLabel("Yes, make my round").click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByPlaceholder("Enter a short description of").click();
  await page
    .getByPlaceholder("Enter a short description of")
    .fill("Testing description!");
  await page.getByTestId("requirement-input").click();
  await page.getByTestId("requirement-input").fill("Be a bot!");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Launch" }).click();
  await page.getByText(roundName).waitFor();
});
