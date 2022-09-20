/** ProgramImplementation contract ABI in Human Readable ABI Format  */

const programImplementation = [
  "event Initialized(uint8 version)",
  "event MetaPtrUpdated(tuple(uint256 protocol, string pointer) oldMetaPtr, tuple(uint256 protocol, string pointer) newMetaPtr)",
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
  "function initialize(bytes encodedParameters)",
  "function metaPtr() view returns (uint256 protocol, string pointer)",
  "function renounceRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function updateMetaPtr(tuple(uint256 protocol, string pointer) newMetaPtr)",
];

export default programImplementation;
