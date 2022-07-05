/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event RoundContractUpdated(address roundAddress)",
  "event RoundCreated(address indexed roundAddress, address indexed ownedBy)",
  "function RoundContract() view returns (address)",
  "function create(address _votingStrategy, uint256 _applicationsStartTime, uint256 _applicationsEndTime, uint256 _roundStartTime, uint256 _roundEndTime, address _token, address _ownedBy, tuple(uint256 protocol, string pointer) _roundMetaPtr, tuple(uint256 protocol, string pointer) _applicationMetaPtr, address[] _roundOperators) returns (address)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateRoundContract(address _RoundContract)"
]

export default roundFactory