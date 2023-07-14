/** MerklePayoutStrategyFactory contract ABI in Human Readable ABI Format  */

const merklePayoutStrategyFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event PayoutContractCreated(address indexed payoutContractAddress, address indexed payoutImplementation)",
  "event PayoutImplementationUpdated(address merklePayoutStrategyAddress)",
  "function create() returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function payoutImplementation() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updatePayoutImplementation(address newPayoutImplementation)",
];

export default merklePayoutStrategyFactory;
