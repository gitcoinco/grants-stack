/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event RoundContractUpdated(address roundAddress)",
  "event RoundCreated(address indexed roundAddress, address indexed ownedBy)",
  "function RoundContract() view returns (address)",
  "function create(bytes _encodedParameters, address _ownedBy) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateRoundContract(address _RoundContract)"
]

export default roundFactory