/** MerklePayoutStrategyImplementation contract ABI in Human Readable ABI Format  */

const merklePayoutStrategyImplementation = [
  "event BatchPayoutSuccessful(address indexed sender)",
  "event DistributionUpdated(bytes32 merkleRoot, tuple(uint256 protocol, string pointer) distributionMetaPtr)",
  "event FundsDistributed(uint256 amount, address grantee, address indexed token, bytes32 indexed projectId)",
  "event FundsWithdrawn(address indexed tokenAddress, uint256 amount, address withdrawAddress)",
  "event Initialized(uint8 version)",
  "event ReadyForPayout()",
  "function LOCK_DURATION() view returns (uint256)",
  "function ROUND_OPERATOR_ROLE() view returns (bytes32)",
  "function VERSION() view returns (string)",
  "function distributionMetaPtr() view returns (uint256 protocol, string pointer)",
  "function hasBeenDistributed(uint256 _index) view returns (bool)",
  "function init()",
  "function initialize()",
  "function isReadyForPayout() view returns (bool)",
  "function merkleRoot() view returns (bytes32)",
  "function payout(bytes[] _distributions) payable",
  "function payout(tuple(uint256 index, address grantee, uint256 amount, bytes32[] merkleProof, bytes32 projectId)[] _distributions) payable",
  "function roundAddress() view returns (address)",
  "function setReadyForPayout() payable",
  "function tokenAddress() view returns (address)",
  "function updateDistribution(bytes encodedDistribution)",
  "function withdrawFunds(address withdrawAddress) payable",
];

export default merklePayoutStrategyImplementation;
