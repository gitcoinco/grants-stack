/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event ProtocolFeePercentageUpdated(uint8 protocolFeePercentage)",
  "event ProtocolTreasuryUpdated(address protocolTreasuryAddress)",
  "event RoundContractUpdated(address roundAddress)",
  "event RoundCreated(address indexed roundAddress, address indexed ownedBy, address indexed roundImplementation)",
  "function VERSION() view returns (string)",
  "function create(bytes encodedParameters, address ownedBy) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function protocolFeePercentage() view returns (uint8)",
  "function protocolTreasury() view returns (address)",
  "function renounceOwnership()",
  "function roundContract() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function updateProtocolFeePercentage(uint8 newProtocolFeePercentage)",
  "function updateProtocolTreasury(address newProtocolTreasury)",
  "function updateRoundContract(address newRoundContract)",
];

export default roundFactory;
