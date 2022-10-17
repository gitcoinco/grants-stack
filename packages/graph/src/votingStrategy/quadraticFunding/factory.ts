import { VotingContractCreated as VotingContractCreatedEvent } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyFactory";
import { QuadraticFundingVotingStrategyImplementation as VotingStrategyContract } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyImplementation";
import { QuadraticFundingVotingStrategyImplementation as VotingStrategyImplementation } from "../../../generated/templates";

import { Round, VotingStrategy } from "../../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

/**
 * @dev Handles indexing on VotingContractCreated event.
 * @param event VotingContractCreatedEvent
 */
export function handleContractCreated(event: VotingContractCreatedEvent): void {
  const votingStrategyContractAddress = event.params.votingContractAddress;
  let votingStrategy = VotingStrategy.load(
    votingStrategyContractAddress.toHex()
  );

  if (!votingStrategy) {
    // create if voting contract does not exist
    votingStrategy = new VotingStrategy(votingStrategyContractAddress.toHex());

    // load voting contract
    const votingStrategyContract = VotingStrategyContract.bind(
      votingStrategyContractAddress
    );

    // set votingStrategy entity fields
    votingStrategy.strategyName = "quadraticFunding";
    votingStrategy.strategyAddress = event.params.votingImplementation.toHex();

    // link to round
    const roundAddress = votingStrategyContract.roundAddress();
    let round = Round.load(roundAddress.toHex());

    if (!round) {
      log.warning("--> handleContractCreated {} : round is null", ["QF"]);
      return;
    }

    votingStrategy.round = round.id;

    votingStrategy.save();

    // VotingStrategyImplementation.create(votingStrategyContractAddress);
  }
}
