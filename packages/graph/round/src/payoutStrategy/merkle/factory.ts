import { PayoutContractCreated as PayoutContractCreatedEvent } from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyFactory";
import { MerklePayoutStrategyImplementation as PayoutStrategyImplementation } from "../../../generated/templates";


import { PayoutStrategy } from "../../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

const VERSION = "0.1.0";

/**
 * @dev Handles indexing on PayoutContractCreated event.
 * @param event PayoutContractCreatedEvent
 */
export function handlePayoutContractCreated(event: PayoutContractCreatedEvent): void {
  const payoutStrategyContractAddress = event.params.payoutContractAddress;
  let payoutStrategy = PayoutStrategy.load(
    payoutStrategyContractAddress.toHex()
  );

  if (payoutStrategy) {
    log.warning("--> handlePayoutContractCreated {} : payoutStrategy already exists", [payoutStrategyContractAddress.toHex()]);
    return;
  }

  // create if payout contract does not exist
  payoutStrategy = new PayoutStrategy(payoutStrategyContractAddress.toHex());

  // set PayoutStrategy entity fields
  payoutStrategy.strategyName = "MERKLE";
  payoutStrategy.strategyAddress = event.params.payoutImplementation.toHex();

  payoutStrategy.version = VERSION;

  payoutStrategy.save();

  PayoutStrategyImplementation.create(payoutStrategyContractAddress);
}
