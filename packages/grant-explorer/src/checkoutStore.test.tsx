import { useCheckoutStore } from "./checkoutStore";
import { CartProject, ProgressStatus } from "./features/api/types";
import { beforeEach } from "vitest";
import { makeApprovedProjectData } from "./test-utils";

const store = useCheckoutStore;
const initialState = store.getState();

describe("Checkout Store", () => {
  /** Reset the store before each test */
  beforeEach(() => {
    store.setState(initialState);
  });

  it("permitStatus manipulation", async () => {
    const store = useCheckoutStore;
    const chain = 1;

    // Initially, the status should be NOT_STARTED for all chains
    expect(store.getState().permitStatus[chain]).toEqual(
      ProgressStatus.NOT_STARTED
    );

    // Update the status
    store.getState().setPermitStatusForChain(chain, ProgressStatus.IN_PROGRESS);
    expect(store.getState().permitStatus[chain]).toEqual(
      ProgressStatus.IN_PROGRESS
    );
  });

  it("voteStatus manipulation", async () => {
    const chain = 1;

    expect(store.getState().voteStatus[chain]).toEqual(
      ProgressStatus.NOT_STARTED
    );

    store.getState().setVoteStatusForChain(chain, ProgressStatus.IN_PROGRESS);
    expect(store.getState().voteStatus[chain]).toEqual(
      ProgressStatus.IN_PROGRESS
    );
  });

  it("chainSwitchStatus manipulation", async () => {
    const chain = 1;

    expect(store.getState().chainSwitchStatus[chain]).toEqual(
      ProgressStatus.NOT_STARTED
    );

    store
      .getState()
      .setChainSwitchStatusForChain(chain, ProgressStatus.IN_PROGRESS);
    expect(store.getState().chainSwitchStatus[chain]).toEqual(
      ProgressStatus.IN_PROGRESS
    );
  });

  it("chainsToCheckout manipulation", async () => {
    expect(store.getState().chainsToCheckout).toEqual([]);

    store.getState().setChainsToCheckout([1]);
    expect(store.getState().chainsToCheckout).toEqual([1]);
  });

  it("chainsToCheckout manipulation", async () => {
    const projects: CartProject[] = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    expect(store.getState().checkedOutProjects).toEqual([]);

    store.getState().setCheckedOutProjects(projects);
    expect(store.getState().checkedOutProjects).toStrictEqual(projects);
    expect(store.getState().getCheckedOutProjects()).toStrictEqual(projects);
  });
});
