import { log } from "@graphprotocol/graph-ts";
import { Voted as VotedEvent } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyImplementation";
import { Round, QFVote, VotingStrategy } from "../../../generated/schema";

/**
 * @dev Handles indexing on Voted event.
 * @param event VotedEvent
 */
export function handleVote(event: VotedEvent): void {
  if (!event.receipt) {
    log.warning("--> handleVote {} : event.receipt is null", ["QF"]);
    return;
  }

  // load voting strategy contract
  const votingStrategyAddress = event.address;
  let votingStrategy = VotingStrategy.load(votingStrategyAddress.toHex());
  if (!votingStrategy) {
    log.warning("--> handleVotingContractCreated {} : votingStrategy is null", [
      "QF",
    ]);
    return;
  }

  // load Round contract
  let round = Round.load(votingStrategy.round!);
  if (!round) {
    log.warning("--> handleVotingContractCreated {} : round is null", [
      "QF",
    ]);
    return;
  }

  // create QFVote entity
  const voteID = event.transaction.hash.toHex();
  const vote = new QFVote(voteID);

  vote.votingStrategy = votingStrategy.id;
  vote.round = round.id;
  vote.token = event.params.token.toHex();
  vote.amount = event.params.amount;
  vote.from = event.params.voter.toHex();
  vote.to = event.params.grantAddress.toHex();

  vote.save();
}
