/** ProgramFactory contract ABI in Human Readable ABI Format  */

const programFactory = [
  "event Initialized(uint8 version)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event ProgramContractUpdated(address programContractAddress)",
  "event ProgramCreated(address indexed programContractAddress)",
  "function create(tuple(uint256 protocol, string pointer) _metaPtr, address[] _programOperators) returns (address)",
  "function initialize()",
  "function owner() view returns (address)",
  "function programContract() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateProgramContract(address _programContract)"
]

export default programFactory