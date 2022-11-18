import erc20 from "./erc20";
import programFactory from "./programFactory";
import programImplementation from "./programImplementation";
import projectRegistry from "./projectRegistry";
import roundFactory from "./roundFactory";
import roundImplementation from "./roundImplementation";
import qfVotingStrategyFactory from "./votingStrategy/qfVotingStrategyFactory";
import merklePayoutStrategy from "./payoutStrategy/merklePayoutStrategy";

const abi = {
  // External
  projectRegistry,
  erc20,

  // Program
  programFactory,
  programImplementation,

  // Round
  roundFactory,
  roundImplementation,

  // VotingStrategy
  qfVotingStrategyFactory,

  // PayoutStrategy
  merklePayoutStrategy,
};

export default abi;
