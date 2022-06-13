/** GrantRoundFactory contract ABI in Human Readable ABI Format  */

const roundFactory = [
  "event OwnershipTransferred(address indexed,address indexed)",
  "event RoundContractUpdated(address)",
  "event RoundCreated(address indexed,address indexed)",
  "function RoundContract() view returns (address)",
  "function create(address,uint256,uint256,uint256,address,address,tuple(uint256,string),address[]) returns (address)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address)",
  "function updateRoundContract(address)"
]

export default roundFactory