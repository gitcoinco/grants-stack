/** GrantRoundImplementation contract ABI in Human Readable ABI Format  */

const roundImplementation = [
  "event Initialized(uint8)",
  "event MetadataUpdated(tuple(uint256,string),tuple(uint256,string))",
  "event RoleAdminChanged(bytes32 indexed,bytes32 indexed,bytes32 indexed)",
  "event RoleGranted(bytes32 indexed,address indexed,address indexed)",
  "event RoleRevoked(bytes32 indexed,address indexed,address indexed)",
  "event TimeUpdated(string,uint256,uint256)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function ROUND_OPERATOR_ROLE() view returns (bytes32)",
  "function applicationsStartTime() view returns (uint256)",
  "function getRoleAdmin(bytes32) view returns (bytes32)",
  "function getRoleMember(bytes32,uint256) view returns (address)",
  "function getRoleMemberCount(bytes32) view returns (uint256)",
  "function grantRole(bytes32,address)",
  "function hasRole(bytes32,address) view returns (bool)",
  "function initialize(address,uint256,uint256,uint256,address,tuple(uint256,string),address,address[])",
  "function metaPtr() view returns (uint256, string)",
  "function renounceRole(bytes32,address)",
  "function revokeRole(bytes32,address)",
  "function roundEndTime() view returns (uint256)",
  "function roundStartTime() view returns (uint256)",
  "function supportsInterface(bytes4) view returns (bool)",
  "function token() view returns (address)",
  "function updateApplicationsStartTime(uint256)",
  "function updateMetaPtr(tuple(uint256,string))",
  "function updateRoundEndTime(uint256)",
  "function updateRoundStartTime(uint256)",
  "function vote(tuple(address,uint256,address,address)[])",
  "function votingContract() view returns (address)"
]

export default roundImplementation