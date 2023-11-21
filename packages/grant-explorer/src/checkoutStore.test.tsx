import { useCheckoutStore } from "./checkoutStore";
import { CartProject, ProgressStatus } from "./features/api/types";
import { ChainId } from "common";
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
    const chain: ChainId = ChainId.MAINNET;

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
    const chain: ChainId = ChainId.MAINNET;

    expect(store.getState().voteStatus[chain]).toEqual(
      ProgressStatus.NOT_STARTED
    );

    store.getState().setVoteStatusForChain(chain, ProgressStatus.IN_PROGRESS);
    expect(store.getState().voteStatus[chain]).toEqual(
      ProgressStatus.IN_PROGRESS
    );
  });

  it("chainSwitchStatus manipulation", async () => {
    const chain: ChainId = ChainId.MAINNET;

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

    store.getState().setChainsToCheckout([ChainId.MAINNET]);
    expect(store.getState().chainsToCheckout).toEqual([ChainId.MAINNET]);
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
