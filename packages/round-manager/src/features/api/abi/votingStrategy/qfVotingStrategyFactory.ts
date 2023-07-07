/** QuadraticFundingVotingStrategyFactory contract ABI in Human Readable ABI Format  */

const qfVotingStrategyFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event VotingContractCreated(address indexed votingContractAddress, address indexed votingImplementation)",
  "event VotingContractUpdated(address votingContractAddress)",
  "function create() returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateVotingContract(address newVotingContract)",
  "function votingContract() view returns (address)",
];

export default qfVotingStrategyFactory;
