// name     : implementation.ts
// status   : legacy
// version  : v1
// abi      : abis/legacy/QuadraticFundingVotingStrategyImplementation/V1.json
// reason   : Vote event is being updated to add a new parameter. 
//            This results in an contract upgrade + ABI change
//            This implementation is being updated to set projectId as
//            the to address (the address to which the funds are sent to)

import { log } from "@graphprotocol/graph-ts";
import { Voted as VotedEvent } from "../../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyImplementationLegacyV1";
import { QFVote, VotingStrategy } from "../../../../generated/schema";
import { generateID } from "../../../utils";

const VERSION = "0.1.0";

/**
 * @dev Handles indexing on Voted event.
 * @param event VotedEvent
 */
export function handleVote(event: VotedEvent): void {

  // load voting strategy contract
  const votingStrategyAddress = event.address;
  let votingStrategy = VotingStrategy.load(votingStrategyAddress.toHex());

  if (!votingStrategy) {
    log.warning("--> handleVotingContractCreated {} {}: votingStrategy is null", [
      "QF",
      votingStrategyAddress.toHex()
    ]);
    return;
  }

  // create QFVote entity
  const voteID = generateID([
    event.transaction.hash.toHex(),
    event.params.grantAddress.toHex()
  ]);
  const vote = new QFVote(voteID);

  vote.votingStrategy = votingStrategy.id;
  vote.token = event.params.token.toHex();
  vote.amount = event.params.amount;
  vote.from = event.params.voter.toHex();
  vote.to = event.params.grantAddress.toHex();

  // set timestamp
  vote.createdAt = event.block.timestamp;
  vote.updatedAt = event.block.timestamp;
  
  // Defaulting projectID to empty string as projectID is not emitted in this ABI
  vote.projectId = ""; 
  vote.version = VERSION;

  vote.save();
}
