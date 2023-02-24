import programFactory from "./programFactory";
import programImplementation from "./programImplementation";
import projectRegistry from "./projectRegistry";
import roundFactory from "./roundFactory";
import roundImplementation from "./roundImplementation";
import qfVotingStrategyFactory from "./votingStrategy/qfVotingStrategyFactory";
import merklePayoutStrategyFactory from "./payoutStrategy/merklePayoutStrategyFactory";
import merklePayoutStrategyImplementation from "./payoutStrategy/merklePayoutStrategyImplementation";

const abi = {
  // External
  projectRegistry,

  // Program
  programFactory,
  programImplementation,

  // Round
  roundFactory,
  roundImplementation,

  // VotingStrategy
  qfVotingStrategyFactory,

  // PayoutStrategy
  merklePayoutStrategyFactory,
  merklePayoutStrategyImplementation,
};

export default abi;
