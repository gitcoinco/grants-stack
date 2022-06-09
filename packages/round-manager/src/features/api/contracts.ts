/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import { Contract } from "./types"



/** ProgramFactory  */
export const programFactoryContract: Contract = {
  address: "0x0EbD2E2130b73107d0C45fF2E16c93E7e2e10e3a",
  abi: [
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

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: [
    "event Initialized(uint8 version)",
    "event MetadataUpdated(tuple(uint256 protocol, string pointer) oldMetaPtr, tuple(uint256 protocol, string pointer) newMetaPtr)",
    "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
    "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function PROGRAM_OPERATOR_ROLE() view returns (bytes32)",
    "function getRoleAdmin(bytes32 role) view returns (bytes32)",
    "function getRoleMember(bytes32 role, uint256 index) view returns (address)",
    "function getRoleMemberCount(bytes32 role) view returns (uint256)",
    "function grantRole(bytes32 role, address account)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function initialize(tuple(uint256 protocol, string pointer) _metaPtr, address[] _programOperators)",
    "function metaPtr() view returns (uint256 protocol, string pointer)",
    "function renounceRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function updateMetaPtr(tuple(uint256 protocol, string pointer) _newMetaPtr)"
  ]
}

/** GrantRoundFactory  */
export const roundFactoryContract: Contract = {
  address: "0x2f97819a05051cC0983988B9E49331E679741309",
  abi: [
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
}

/** GrantRoundImplementation */
export const roundImplementationContract: Contract = {
  abi: [
    "event Initialized(uint8 version)",
    "event MetadataUpdated(tuple(uint256 protocol, string pointer) oldMetaPtr, tuple(uint256 protocol, string pointer) newMetaPtr)",
    "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
    "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    "event TimeUpdated(string typeOfTime, uint256 oldTime, uint256 newTime)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function ROUND_OPERATOR_ROLE() view returns (bytes32)",
    "function getRoleAdmin(bytes32 role) view returns (bytes32)",
    "function grantApplicationsStartTime() view returns (uint256)",
    "function grantRole(bytes32 role, address account)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function initialize(address _votingContract, uint256 _grantApplicationsStartTime, uint256 _roundStartTime, uint256 _roundEndTime, address _token, tuple(uint256 protocol, string pointer) _metaPtr, address[] _roundOperators)",
    "function metaPtr() view returns (uint256 protocol, string pointer)",
    "function renounceRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function roundEndTime() view returns (uint256)",
    "function roundStartTime() view returns (uint256)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function token() view returns (address)",
    "function updateGrantApplicationsStartTime(uint256 _newGrantApplicationsStartTime)",
    "function updateMetaPtr(tuple(uint256 protocol, string pointer) _newMetaPtr)",
    "function updateRoundEndTime(uint256 _newRoundEndTime)",
    "function updateRoundStartTime(uint256 _newRoundStartTime)",
    "function vote(tuple(address token, uint256 amount, address grantAddress, address voterAddress)[] _votes)",
    "function votingContract() view returns (address)"
  ]
}