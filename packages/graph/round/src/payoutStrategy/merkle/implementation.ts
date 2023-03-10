import { log } from "@graphprotocol/graph-ts";
import {
  FundsDistributed as FundsDistributedEvent,
  DistributionUpdated as DistributionUpdatedEvent,
  ReadyForPayout as ReadyForPayoutEvent
} from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyImplementation";
import { PayoutStrategy, Payout, MetaPtr } from "../../../generated/schema";
import { generateID, updateMetaPtr } from "../../utils";

const VERSION = "0.1.0";


/**
 * Handles indexing on DistributionUpdated event.
 * @param event DistributionUpdatedEvent
 */
export function handleDistributionUpdated(event: DistributionUpdatedEvent): void {

  // load payout strategy contract
  const payoutStrategyAddress = event.address;
  let payoutStrategy = PayoutStrategy.load(payoutStrategyAddress.toHex());

  if (!payoutStrategy) {
    log.warning("--> handleDistributionUpdated {} {}: payoutStrategy is null", [
      "MERKLE",
      payoutStrategyAddress.toHex()
    ]);
    return;
  }

  // create new MetaPtr entity
  const metaPtrId = ["distributionMetaPtr", payoutStrategy.id].join("-");

  const _metaPtr = event.params.distributionMetaPtr;
  const protocol = _metaPtr[0].toI32();
  const pointer = _metaPtr[1].toString();

  const distributionMetaPtr = updateMetaPtr(metaPtrId, protocol, pointer);

  payoutStrategy.distributionMetaPtr = distributionMetaPtr.id;

  payoutStrategy.updatedAt = event.block.timestamp;

  payoutStrategy.save();
}

/**
 * Indexes ReadyForPayout event.
 * @param event ReadyForPayoutEvent
 * @returns
 */
export function handleReadyForPayout(event: ReadyForPayoutEvent): void {
  // load payout strategy contract
  const payoutStrategyAddress = event.address;
  let payoutStrategy = PayoutStrategy.load(payoutStrategyAddress.toHex());

  if (!payoutStrategy) {
    log.warning("--> handleSetReadyForPayout {} {}: payoutStrategy is null", [
      "MERKLE",
      payoutStrategyAddress.toHex()
    ]);
    return;
  }

  payoutStrategy.isReadyForPayout = true;

  payoutStrategy.updatedAt = event.block.timestamp;

  payoutStrategy.save();
}

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