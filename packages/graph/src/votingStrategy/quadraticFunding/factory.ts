import { VotingContractCreated as VotingContractCreatedEvent } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyFactory";
import { QuadraticFundingVotingStrategyImplementation as VotingStrategyImplementation } from "../../../generated/templates";

import { VotingStrategy } from "../../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

/**
 * @dev Handles indexing on VotingContractCreated event.
 * @param event VotingContractCreatedEvent
 */
export function handleVotingContractCreated(event: VotingContractCreatedEvent): void {
  const votingStrategyContractAddress = event.params.votingContractAddress;
  let votingStrategy = VotingStrategy.load(
    votingStrategyContractAddress.toHex()
  );

  if (votingStrategy) {
    log.warning("--> handleVotingContractCreated {} : votingStrategy already exists", [votingStrategyContractAddress.toHex()]);
    return;
  }

  // create if voting contract does not exist
  votingStrategy = new VotingStrategy(votingStrategyContractAddress.toHex());

  // set votingStrategy entity fields
  votingStrategy.strategyName = "quadraticFunding";
  votingStrategy.strategyAddress = event.params.votingImplementation.toHex();

  votingStrategy.save();

  VotingStrategyImplementation.create(votingStrategyContractAddress);
}
