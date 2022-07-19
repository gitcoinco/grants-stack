
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../votingStrategy/IVotingStrategy.sol";

import "../utils/MetaPtr.sol";

/**
 * @notice Contract deployed per Round which would managed by
 * a group of ROUND_OPERATOR via the RoundFactory
 *
 */
contract RoundImplementation is AccessControlEnumerable, Initializable {

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

  // --- Core methods ---

  /**
   * @notice Instantiates a new round
   * @param _encodedParameters Encoded parameters for program creation
   * @dev _encodedParameters
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
    bytes calldata _encodedParameters
  ) public initializer {

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
      _encodedParameters, (
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
  /// @param _newRoundMetaPtr new roundMetaPtr
  function updateRoundMetaPtr(MetaPtr memory _newRoundMetaPtr) public onlyRole(ROUND_OPERATOR_ROLE) {

    emit RoundMetaPtrUpdated(roundMetaPtr, _newRoundMetaPtr);

    roundMetaPtr = _newRoundMetaPtr;
  }

  // @notice Update applicationMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param _newApplicationMetaPtr new applicationMetaPtr
  function updateApplicationMetaPtr(MetaPtr memory _newApplicationMetaPtr) public onlyRole(ROUND_OPERATOR_ROLE) {

    emit ApplicationMetaPtrUpdated(applicationMetaPtr, _newApplicationMetaPtr);

    applicationMetaPtr = _newApplicationMetaPtr;
  }

  /// @notice Update roundStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundStartTime new roundStartTime
  function updateRoundStartTime(uint256 _newRoundStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundStartTime >= block.timestamp, "updateRoundStartTime: start time has already passed");
    require(_newRoundStartTime >= applicationsStartTime, "updateRoundStartTime: start time should be after application start time");
    require(_newRoundStartTime < roundEndTime, "updateRoundStartTime: start time should be before round end time");

    emit RoundStartTimeUpdated(roundStartTime, _newRoundStartTime);

    roundStartTime = _newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 _newRoundEndTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundEndTime >= block.timestamp, "updateRoundEndTime: end time has already passed");
    require(_newRoundEndTime > roundStartTime, "updateRoundEndTime: end time should be after start time");
    require(_newRoundEndTime >= applicationsEndTime, "updateRoundEndTime: end time should be after application end time");

    emit RoundEndTimeUpdated(roundEndTime, _newRoundEndTime);

    roundEndTime = _newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 _newApplicationsStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newApplicationsStartTime >= block.timestamp, "updateApplicationsStartTime: application start time has already passed");
    require(_newApplicationsStartTime <= roundStartTime, "updateApplicationsStartTime: should be before round start time");
    require(_newApplicationsStartTime < applicationsEndTime, "updateApplicationsStartTime: should be before application end time");

    emit ApplicationsStartTimeUpdated(applicationsStartTime, _newApplicationsStartTime);

    applicationsStartTime = _newApplicationsStartTime;
  }

  /// @notice Update applicationsEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newApplicationsEndTime new applicationsEndTime
  function updateApplicationsEndTime(uint256 _newApplicationsEndTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newApplicationsEndTime >= block.timestamp, "updateApplicationsEndTime: application end time has already passed");
    require(_newApplicationsEndTime > applicationsStartTime, "updateApplicationsEndTime: application end time should be after application start time");
    require(_newApplicationsEndTime <= roundEndTime, "updateApplicationsEndTime: should be before round end time");

    emit ApplicationsEndTimeUpdated(applicationsEndTime, _newApplicationsEndTime);

    applicationsEndTime = _newApplicationsEndTime;
  }

  /// @notice Update projectsMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param _newProjectsMetaPtr new ProjectsMetaPtr
  function updateProjectsMetaPtr(MetaPtr calldata _newProjectsMetaPtr) public onlyRole(ROUND_OPERATOR_ROLE) {

    emit ProjectsMetaPtrUpdated(projectsMetaPtr, _newProjectsMetaPtr);

    projectsMetaPtr = _newProjectsMetaPtr;
  }

  /// @notice Submit a project application
  /// @param _projectID unique hash of the project
  /// @param _applicationMetaPtr appliction metaPtr
  function applyToRound(bytes32 _projectID, MetaPtr calldata _applicationMetaPtr) public {
    emit NewProjectApplication(_projectID, _applicationMetaPtr);
  }

  /// @notice Invoked by voter to cast votes
  /// @param _encodedVotes encoded vote
  function vote(bytes[] memory _encodedVotes) public {

    votingStrategy.vote(_encodedVotes, msg.sender);
  }
}
