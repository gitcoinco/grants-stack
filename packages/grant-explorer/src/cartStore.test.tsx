import { useCartStorage } from "./store";
import { ChainId, VotingToken } from "common";
import { CartProject } from "./features/api/types";
import { makeApprovedProjectData } from "./test-utils";
import { votingTokensMap } from "./features/api/utils";

describe("useCartStorage Zustand store", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure a clean state
    localStorage.clear();
    useCartStorage.getState().clear();
  });

  test("should add projects to the store", () => {
    const project: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project);

    expect(useCartStorage.getState().projects).toContain(project);
  });

  test("should add multiple projects to the store", () => {
    const project1: CartProject = makeApprovedProjectData();
    const project2: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project1);
    useCartStorage.getState().add(project2);

    expect(useCartStorage.getState().projects).toContain(project1);
    expect(useCartStorage.getState().projects).toContain(project2);
  });

  test("should remove a project from the store", () => {
    const project = makeApprovedProjectData();

    useCartStorage.getState().add(project);
    useCartStorage.getState().remove(project);

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
      .updateDonationAmount(
        project.chainId,
        project.roundId,
        project.grantApplicationId,
        updatedAmount
      );

    const updatedProject = useCartStorage
      .getState()
      .projects.find(
        (p) => p.grantApplicationId === project.grantApplicationId
      );
    expect(updatedProject?.amount).toBe(updatedAmount);
  });

  test("should set payout token for a specific chain", () => {
    const chainId: ChainId = ChainId.MAINNET; // Mock ChainId
    const payoutToken: VotingToken = votingTokensMap[ChainId.MAINNET][0];

    useCartStorage.getState().setVotingTokenForChain(chainId, payoutToken);

    expect(useCartStorage.getState().chainToVotingToken[chainId]).toEqual(
      payoutToken
    );
  });

  test("should not add duplicate projects to the store", () => {
    const project: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project);
    useCartStorage.getState().add({ ...project });

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

    useCartStorage
      .getState()
      .updateDonationAmount(1, "1", nonExistingId, "500");

    // Assert that the store state remains unchanged
    expect(useCartStorage.getState().projects).toEqual(initialProjects);
  });

  test("should override voting token for a specific chain", () => {
    const chainId: ChainId = ChainId.MAINNET; // Mock ChainId
    const initialVotingToken: VotingToken = votingTokensMap[ChainId.MAINNET][0];
    const newVotingToken: VotingToken = votingTokensMap[ChainId.MAINNET][1];

    useCartStorage
      .getState()
      .setVotingTokenForChain(chainId, initialVotingToken);
    useCartStorage.getState().setVotingTokenForChain(chainId, newVotingToken);

    expect(useCartStorage.getState().chainToVotingToken[chainId]).toEqual(
      newVotingToken
    );
  });

  test("should handle removal of non-existing project gracefully", () => {
    const initialProjects = [...useCartStorage.getState().projects];
    const nonExistingId = "1234"; // Mock ID
    const nonExistingProject: CartProject = makeApprovedProjectData();
    nonExistingProject.grantApplicationId = nonExistingId;

    useCartStorage.getState().remove(nonExistingProject);

    // Assert that the store state remains unchanged
    expect(useCartStorage.getState().projects).toEqual(initialProjects);
  });

  test("should handle adding a project with duplicate ID gracefully", () => {
    const project: CartProject = makeApprovedProjectData();

    const modifiedProject: CartProject = {
      ...project,
      status: "REJECTED",
    };

    useCartStorage.getState().add(project);
    useCartStorage.getState().add(modifiedProject);

    expect(useCartStorage.getState().projects).toHaveLength(1);
    expect(useCartStorage.getState().projects).toContainEqual(modifiedProject);
  });

  test("should handle invalid donation amount updates gracefully", () => {
    const project: CartProject = makeApprovedProjectData();

    useCartStorage.getState().add(project);
    useCartStorage
      .getState()
      .updateDonationAmount(
        project.chainId,
        project.roundId,
        project.grantApplicationId,
        "-50"
      );

    // Assuming negative donations are invalid and thus unchanged:
    expect(
      useCartStorage
        .getState()
        .projects.find(
          (p) => p.grantApplicationId === project.grantApplicationId
        )?.amount
    ).not.toBe("-50");
  });

  test("should handle setting payout token for non-existing chain gracefully", () => {
    const nonExistingChainId = 123123; // Mock a non-existing ChainId
    const payoutToken: VotingToken = votingTokensMap[ChainId.MAINNET][0];

    const initialChainToPayoutToken = {
      ...useCartStorage.getState().chainToVotingToken,
    };

    useCartStorage
      .getState()
      // @ts-expect-error We purposefully pass a wrong ChainId here
      .setVotingTokenForChain(nonExistingChainId, payoutToken);

    // The state should remain unchanged.
    expect(useCartStorage.getState().chainToVotingToken).toEqual(
      initialChainToPayoutToken
    );
  });
});
