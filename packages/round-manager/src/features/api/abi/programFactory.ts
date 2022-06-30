/** ProgramFactory contract ABI in Human Readable ABI Format  */

const programFactory = [
  "event Initialized(uint8)",
  "event OwnershipTransferred(address indexed,address indexed)",
  "event ProgramContractUpdated(address)",
  "event ProgramCreated(address indexed)",
  "function create(tuple(uint256,string),address[]) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function programContract() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address)",
  "function updateProgramContract(address)"
]

export default programFactory