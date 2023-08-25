/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event AlloSettingsUpdated(address alloSettings)",
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event RoundCreated(address indexed roundAddress, address indexed ownedBy, address indexed roundImplementation)",
  "event RoundImplementationUpdated(address roundImplementation)",
  "function VERSION() view returns (string)",
  "function alloSettings() view returns (address)",
  "function create(bytes encodedParameters, address ownedBy) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function roundImplementation() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function updateAlloSettings(address newAlloSettings)",
  "function updateRoundImplementation(address newRoundImplementation)",
];

export default roundFactory;
