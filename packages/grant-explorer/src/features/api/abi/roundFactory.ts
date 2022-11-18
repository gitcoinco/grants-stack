/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event RoundContractUpdated(address roundAddress)",
  "event RoundCreated(address indexed roundAddress, address indexed ownedBy, address indexed roundImplementation)",
  "function create(bytes encodedParameters, address ownedBy) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function roundContract() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function updateRoundContract(address newRoundContract)",
];

export default roundFactory;
