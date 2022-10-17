import { log } from "@graphprotocol/graph-ts";
import { Voted as VotedEvent } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyImplementation";
import { QFVote, VotingStrategy } from "../../../generated/schema";
/**
 * @dev Handles indexing on Voted event.
 * @param event VotedEvent
 */
export function handleVote(event: VotedEvent): void {
  if (!event.receipt) {
    log.warning("--> handleVote {} : event.receipt is null", ["QF"]);
    return;
  }

  if (event.receipt.logs.length == 0) {
    log.warning("--> handleVote {} : event.receipt.logs is empty", ["QF"]);
    return;
  }

  // load voting strategy contract
  const votingStrategyAddress = event.receipt.logs[0].address;
  let votingStrategy = VotingStrategy.load(votingStrategyAddress.toHex());
  if (!votingStrategy) {
    log.warning("--> handleContractCreated {} : votingStrategy is null", [
      "QF",
    ]);
    return;
  }

  // create QFVote entity
  const voteID = event.receipt.transactionHash.toHex();
  let vote = QFVote.load(voteID);
  vote = vote == null ? new QFVote(voteID) : vote;

  vote.votingStrategy = votingStrategy.id;
  vote.votingStrategy = votingStrategy.round;
  vote.token = event.params.token.toHex();
  vote.amount = event.params.amount;
  vote.from = event.params.voter.toHex();
  vote.to = event.params.grantAddress.toHex();

  vote.save();
}
