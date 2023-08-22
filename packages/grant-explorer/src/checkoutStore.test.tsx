import { useCheckoutStore } from "./checkoutStore"; // Adjust this import to your file structure
import { ProgressStatus } from "./features/api/types";
import { ChainId } from "common";

const store = useCheckoutStore;

it("Checkout Store - permitStatus manipulation", async () => {
  const store = useCheckoutStore;
  const chain: ChainId = ChainId.MAINNET; // Replace with actual ChainId

  // Initially, the status should be NOT_STARTED for all chains
  assert.equal(
    store.getState().permitStatus[chain],
    ProgressStatus.NOT_STARTED
  );

  // Update the status
  store.getState().setPermitStatusForChain(chain, ProgressStatus.IN_PROGRESS);
  expect(store.getState().permitStatus[chain]).toEqual(
    ProgressStatus.IN_PROGRESS
  );
});

it("Checkout Store - voteStatus manipulation", async () => {
  const chain: ChainId = ChainId.MAINNET; // Replace with actual ChainId

  assert.equal(store.getState().voteStatus[chain], ProgressStatus.NOT_STARTED);

  store.getState().setVoteStatusForChain(chain, ProgressStatus.IN_PROGRESS);
  expect(store.getState().voteStatus[chain]).toEqual(
    ProgressStatus.IN_PROGRESS
  );
});

it("Checkout Store - chainSwitchStatus manipulation", async () => {
  const chain: ChainId = ChainId.MAINNET; // Replace with actual ChainId

  assert.equal(
    store.getState().chainSwitchStatus[chain],
    ProgressStatus.NOT_STARTED
  );

  store
    .getState()
    .setChainSwitchStatusForChain(chain, ProgressStatus.IN_PROGRESS);
  expect(store.getState().chainSwitchStatus[chain]).toEqual(
    ProgressStatus.IN_PROGRESS
  );
});
