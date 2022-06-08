/** ProgramFactory address and Contract ABI in the Human-Readable ABI format */
export const programFactoryContract = {
  address: "0xc2A3EB8b0aaFd6119a47AFa729722D300C94e48b",
  abi: [
    //
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    "event ProgramContractUpdated(address programContractAddress)",
    "event ProgramCreated(address programContractAddress)",
    "function create(tuple(uint256 protocol, string pointer) _metaPtr, address[] _programOperators) returns (address)",
    "function owner() view returns (address)",
    "function programContract() view returns (address)",
    "function renounceOwnership()",
    "function transferOwnership(address newOwner)",
    "function updateProgramContract(address _programContract)"
  ]
}
