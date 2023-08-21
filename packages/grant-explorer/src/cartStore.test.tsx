// cartStore.test.ts

import { useCartStorage } from "./store";
import { ChainId } from "common";
import { CartProject, PayoutToken } from "./features/api/types";
import { makeApprovedProjectData } from "./test-utils";
import { payoutTokensMap } from "./features/api/utils";

describe("useCartStorage Zustand store", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure a clean state
    localStorage.clear();
  });

  test("should add projects to the store", () => {
    const project: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project);

    expect(useCartStorage.getState().projects).toContain(project);
  });

  test("should remove a project from the store", () => {
    const project = makeApprovedProjectData();

    useCartStorage.getState().add(project);
    useCartStorage.getState().remove(project.grantApplicationId);

    expect(useCartStorage.getState().projects).not.toContain(project);
  });

  test("should clear all projects from the store", () => {
    const project1: CartProject = makeApprovedProjectData();

    const project2: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project1);
    useCartStorage.getState().add(project2);
    useCartStorage.getState().clear();

    expect(useCartStorage.getState().projects).toHaveLength(0);
  });

  test("should update donation amount for a specific project", () => {
    const project: CartProject = makeApprovedProjectData();

    const updatedAmount = "100"; // Mock amount

    useCartStorage.getState().add(project);
    useCartStorage
      .getState()
      .updateDonationAmount(project.grantApplicationId, updatedAmount);

    const updatedProject = useCartStorage
      .getState()
      .projects.find(
        (p) => p.grantApplicationId === project.grantApplicationId
      );
    expect(updatedProject?.amount).toBe(updatedAmount);
  });

  test("should set payout token for a specific chain", () => {
    const chainId: ChainId = ChainId.MAINNET; // Mock ChainId
    const payoutToken: PayoutToken = payoutTokensMap[ChainId.MAINNET][0];

    useCartStorage.getState().setPayoutTokenForChain(chainId, payoutToken);

    expect(useCartStorage.getState().chainToPayoutToken[chainId]).toEqual(
      payoutToken
    );
  });

  test("should not add duplicate projects to the store", () => {
    const project: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project);
    useCartStorage.getState().add(project);

    // Assert that the project was only added once
    const matchingProjects = useCartStorage
      .getState()
      .projects.filter(
        (p) => p.grantApplicationId === project.grantApplicationId
      );
    expect(matchingProjects).toHaveLength(1);
  });

  test("should update donations for all projects with a specific chain", () => {
    const chainId: ChainId = ChainId.MAINNET; // Mock ChainId

    const project1: CartProject = makeApprovedProjectData();
    const project2: CartProject = makeApprovedProjectData();

    const updatedAmount = "200"; // Mock amount

    useCartStorage.getState().add(project1);
    useCartStorage.getState().add(project2);
    useCartStorage.getState().updateDonationsForChain(chainId, updatedAmount);

    const updatedProjects = useCartStorage
      .getState()
      .projects.filter((p) => p.chainId === chainId);
    updatedProjects.forEach((proj) => {
      expect(proj.amount).toBe(updatedAmount);
    });
  });

  test("should not update donation amount for a non-existing project", () => {
    const nonExistingId = "1234"; // Mock ID
    const initialProjects = [...useCartStorage.getState().projects];

    useCartStorage.getState().updateDonationAmount(nonExistingId, "500");

    // Assert that the store state remains unchanged
    expect(useCartStorage.getState().projects).toEqual(initialProjects);
  });

  test("should override payout token for a specific chain", () => {
    const chainId: ChainId = ChainId.MAINNET; // Mock ChainId
    const initialPayoutToken: PayoutToken = payoutTokensMap[ChainId.MAINNET][0];
    const newPayoutToken: PayoutToken = payoutTokensMap[ChainId.MAINNET][1];

    useCartStorage
      .getState()
      .setPayoutTokenForChain(chainId, initialPayoutToken);
    useCartStorage.getState().setPayoutTokenForChain(chainId, newPayoutToken);

    expect(useCartStorage.getState().chainToPayoutToken[chainId]).toEqual(
      newPayoutToken
    );
  });
});
