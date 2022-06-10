/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event GrantRoundContractUpdated(address grantRoundAddress)",
  "event GrantRoundCreated(address indexed grantRoundAddress, address indexed ownedBy)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "function create(address _votingContract, uint256 _grantApplicationsStartTime, uint256 _roundStartTime, uint256 _roundEndTime, address _token, address _ownedBy, tuple(uint256 protocol, string pointer) _metaPtr, address[] _roundOperators) returns (address)",
  "function grantRoundContract() view returns (address)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateGrantRoundContract(address _grantRoundContract)"
]

export default roundFactory