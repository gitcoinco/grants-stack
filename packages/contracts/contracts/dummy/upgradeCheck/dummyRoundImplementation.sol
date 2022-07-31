
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../../votingStrategy/IVotingStrategy.sol";

import "../../utils/MetaPtr.sol";


/**
 * @notice Contract deployed per Round which would managed by
 * a group of ROUND_OPERATOR via the RoundFactory
 *
 */
contract DummyRoundImplementation is AccessControlEnumerable, Initializable {

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");


  // --- Events ---

  /// @notice Emitted when the round metaPtr is updated
  event RoundMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when the application form metaPtr is updated
  event ApplicationMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when application start time is updated
  event ApplicationsStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when application end time is updated
  event ApplicationsEndTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round start time is updated
  event RoundStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round end time is updated
  event RoundEndTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when projects metaPtr is updated
  event ProjectsMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when a project has applied to the round
  event NewProjectApplication(bytes32 indexed project, MetaPtr applicationMetaPtr);


  // --- Data ---

  /// @notice Voting Strategy Contract Address
  IVotingStrategy public votingStrategy;

  /// @notice Unix timestamp from when round can accept applications
  uint256 public applicationsStartTime;

  /// @notice Unix timestamp from when round stops accepting applications
  uint256 public applicationsEndTime;

  /// @notice Unix timestamp of the start of the round
  uint256 public roundStartTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public roundEndTime;

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public token;

  /// @notice MetaPtr to the round metadata
  MetaPtr public roundMetaPtr;

  /// @notice MetaPtr to the application form schema
  MetaPtr public applicationMetaPtr;

  /// @notice MetaPtr to the projects
  MetaPtr public projectsMetaPtr;

  string public foobar;

  // --- Core methods ---

  /**
   * @notice Instantiates a new round
   * @param encodedParameters Encoded parameters for program creation
   * @dev encodedParameters
   *  - _applicationsStartTime Unix timestamp from when round can accept applications
   *  - _applicationsEndTime Unix timestamp from when round stops accepting applications
   *  - _roundStartTime Unix timestamp of the start of the round
   *  - _roundEndTime Unix timestamp of the end of the round
   *  - _token Address of the ERC20 token for accepting matching pool contributions
   *  - _roundMetaPtr MetaPtr to the round metadata
   *  - _applicationMetaPtr MetaPtr to the application form schema
   *  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
   *  - _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function initialize(
    bytes calldata encodedParameters,
    string calldata newFoobar
  ) external initializer {

    foobar = newFoobar;

    // Decode _encodedParameters
    (
      IVotingStrategy _votingStrategy,
      uint256 _applicationsStartTime,
      uint256 _applicationsEndTime,
      uint256 _roundStartTime,
      uint256 _roundEndTime,
      IERC20 _token,
      MetaPtr memory _roundMetaPtr,
      MetaPtr memory _applicationMetaPtr,
      address[] memory _adminRoles,
      address[] memory _roundOperators
    ) = abi.decode(
      encodedParameters, (
      IVotingStrategy,
      uint256,
      uint256,
      uint256,
      uint256,
      IERC20,
      MetaPtr,
      MetaPtr,
      address[],
      address[]
    ));

    // slither-disable-next-line timestamp
    require(_applicationsStartTime >= block.timestamp, "initialize: applications start time has already passed");
    require(_applicationsEndTime > _applicationsStartTime, "initialize: application end time should be after application start time");

    require(_roundEndTime >= _applicationsEndTime, "initialize: application end time should be before round end time");
    require(_roundEndTime > _roundStartTime, "initialize: end time should be after start time");

    require(_roundStartTime >= _applicationsStartTime, "initialize: round start time should be after application start time");


    votingStrategy = _votingStrategy;
    applicationsStartTime = _applicationsStartTime;
    applicationsEndTime = _applicationsEndTime;
    roundStartTime = _roundStartTime;
    roundEndTime = _roundEndTime;
    token = _token;

    // Emit RoundMetaPtrUpdated event for indexing
    emit RoundMetaPtrUpdated(roundMetaPtr, _roundMetaPtr);
    roundMetaPtr = _roundMetaPtr;

    // Emit ApplicationMetaPtrUpdated event for indexing
    emit ApplicationMetaPtrUpdated(applicationMetaPtr, _applicationMetaPtr);
    applicationMetaPtr = _applicationMetaPtr;

    // Assigning default admin role
    for (uint256 i = 0; i < _adminRoles.length; ++i) {
      _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
    }

    // Assigning round operators
    for (uint256 i = 0; i < _roundOperators.length; ++i) {
      _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
    }
  }

  // @notice Update roundMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundMetaPtr new roundMetaPtr
  function updateRoundMetaPtr(MetaPtr memory newRoundMetaPtr) external onlyRole(ROUND_OPERATOR_ROLE) {

    emit RoundMetaPtrUpdated(roundMetaPtr, newRoundMetaPtr);

    roundMetaPtr = newRoundMetaPtr;
  }

  // @notice Update applicationMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationMetaPtr new applicationMetaPtr
  function updateApplicationMetaPtr(MetaPtr memory newApplicationMetaPtr) external onlyRole(ROUND_OPERATOR_ROLE) {

    emit ApplicationMetaPtrUpdated(applicationMetaPtr, newApplicationMetaPtr);

    applicationMetaPtr = newApplicationMetaPtr;
  }

  /// @notice Update roundStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundStartTime new roundStartTime
  function updateRoundStartTime(uint256 newRoundStartTime) external onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newRoundStartTime >= block.timestamp, "updateRoundStartTime: start time has already passed");
    require(newRoundStartTime >= applicationsStartTime, "updateRoundStartTime: start time should be after application start time");
    require(newRoundStartTime < roundEndTime, "updateRoundStartTime: start time should be before round end time");

    emit RoundStartTimeUpdated(roundStartTime, newRoundStartTime);

    roundStartTime = newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 newRoundEndTime) external onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newRoundEndTime >= block.timestamp, "updateRoundEndTime: end time has already passed");
    require(newRoundEndTime > roundStartTime, "updateRoundEndTime: end time should be after start time");
    require(newRoundEndTime >= applicationsEndTime, "updateRoundEndTime: end time should be after application end time");

    emit RoundEndTimeUpdated(roundEndTime, newRoundEndTime);

    roundEndTime = newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 newApplicationsStartTime) external onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsStartTime >= block.timestamp, "updateApplicationsStartTime: application start time has already passed");
    require(newApplicationsStartTime <= roundStartTime, "updateApplicationsStartTime: should be before round start time");
    require(newApplicationsStartTime < applicationsEndTime, "updateApplicationsStartTime: should be before application end time");

    emit ApplicationsStartTimeUpdated(applicationsStartTime, newApplicationsStartTime);

    applicationsStartTime = newApplicationsStartTime;
  }

  /// @notice Update applicationsEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsEndTime new applicationsEndTime
  function updateApplicationsEndTime(uint256 newApplicationsEndTime) external onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsEndTime >= block.timestamp, "updateApplicationsEndTime: application end time has already passed");
    require(newApplicationsEndTime > applicationsStartTime, "updateApplicationsEndTime: application end time should be after application start time");
    require(newApplicationsEndTime <= roundEndTime, "updateApplicationsEndTime: should be before round end time");

    emit ApplicationsEndTimeUpdated(applicationsEndTime, newApplicationsEndTime);

    applicationsEndTime = newApplicationsEndTime;
  }

  /// @notice Update projectsMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newProjectsMetaPtr new ProjectsMetaPtr
  function updateProjectsMetaPtr(MetaPtr calldata newProjectsMetaPtr) external onlyRole(ROUND_OPERATOR_ROLE) {

    emit ProjectsMetaPtrUpdated(projectsMetaPtr, newProjectsMetaPtr);

    projectsMetaPtr = newProjectsMetaPtr;
  }

  /// @notice Submit a project application
  /// @param projectID unique hash of the project
  /// @param newApplicationMetaPtr appliction metaPtr
  function applyToRound(bytes32 projectID, MetaPtr calldata newApplicationMetaPtr) external {
    emit NewProjectApplication(projectID, newApplicationMetaPtr);
  }

  /// @notice Invoked by voter to cast votes
  /// @param encodedVotes encoded vote
  function vote(bytes[] memory encodedVotes) external {

    votingStrategy.vote(encodedVotes, msg.sender);
  }
}
