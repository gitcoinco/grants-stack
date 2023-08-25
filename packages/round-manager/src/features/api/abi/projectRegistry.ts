/** GrantHub's projectRegistry contract ABI in Human Readable ABI Format  */

const projectRegistry = [
  "event Initialized(uint8 version)",
  "event MetadataUpdated(uint256 indexed projectID, tuple(uint256 protocol, string pointer) metaPtr)",
  "event OwnerAdded(uint256 indexed projectID, address indexed owner)",
  "event OwnerRemoved(uint256 indexed projectID, address indexed owner)",
  "event ProjectCreated(uint256 indexed projectID, address indexed owner)",
  "function addProjectOwner(uint256 projectID, address newOwner)",
  "function createProject(tuple(uint256 protocol, string pointer) metadata)",
  "function getProjectOwners(uint256 projectID) view returns (address[])",
  "function initialize()",
  "function projectOwnersCount(uint256 projectID) view returns (uint256)",
  "function projects(uint256) view returns (uint256 id, tuple(uint256 protocol, string pointer) metadata)",
  "function projectsCount() view returns (uint256)",
  "function projectsOwners(uint256) view returns (uint256 count)",
  "function removeProjectOwner(uint256 projectID, address prevOwner, address owner)",
  "function updateProjectMetadata(uint256 projectID, tuple(uint256 protocol, string pointer) metadata)",
];

export default projectRegistry;
