import { log } from "@graphprotocol/graph-ts";
import { FundsDistributed as FundsDistributedEvent } from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyImplementation";
import { PayoutStrategy, Payout } from "../../../generated/schema";
import { generateID } from "../../utils";

const VERSION = "0.1.0";

/**
 * @dev Handles indexing on FundsDistributed event.
 * @param event FundsDistributedEvent
 */
export function handleFundsDistributed(event: FundsDistributedEvent): void {

  // load payout strategy contract
  const payoutStrategyAddress = event.address;
  let payoutStrategy = PayoutStrategy.load(payoutStrategyAddress.toHex());

  if (!payoutStrategy) {
    log.warning("--> handleFundsDistributed {} {}: payoutStrategy is null", [
      "MERKLE",
      payoutStrategyAddress.toHex()
    ]);
    return;
  }

  // create Payout entity
  const payoutID = generateID([
    event.transaction.hash.toHex(),
    event.params.projectId.toString()
  ]);

  const payout = new Payout(payoutID);
  
  payout.payoutStrategy = payoutStrategy.id;
  payout.amount = event.params.amount;
  payout.token = event.params.token.toHex();
  payout.projectId = event.params.projectId.toString();
  payout.grantee = event.params.grantee.toHex();
  
  payout.txnHash = event.transaction.hash.toHex();

  // set timestamp
  payout.createdAt = event.block.timestamp;
  
  payout.version = VERSION;

  payout.save();
}