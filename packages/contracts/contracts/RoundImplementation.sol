
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./votingStrategy/IVotingStrategy.sol";

import "./utils/MetaPtr.sol";

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
  event ApplicationStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round start time is updated
  event RoundStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round end time is updated
  event RoundEndTimeUpdated(uint256 oldTime, uint256 newTime);

  // --- Data ---

  /// @notice Voting Strategy Contract Address
  IVotingStrategy public votingStrategy;

  /// @notice Unix timestamp from when round can accept applications
  uint256 public applicationsStartTime;

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


  // --- Core methods ---

  /**
   * @notice Instantiates a new round
   * @param _votingStrategy Deployed Voting Strategy Contract
   * @param _applicationsStartTime Unix timestamp from when round can accept applications
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _roundMetaPtr MetaPtr to the round metadata
   * @param _applicationMetaPtr MetaPtr to the application form schema
   * @param _adminRole Address to be granted DEFAULT_ADMIN_ROLE
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function initialize(
    IVotingStrategy _votingStrategy,
    uint256 _applicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    MetaPtr memory _roundMetaPtr,
    MetaPtr calldata _applicationMetaPtr,
    address _adminRole,
    address[] memory _roundOperators
  ) public initializer {

    require(_roundStartTime >= block.timestamp, "initialize: start time has already passed");
    require(_roundEndTime > _roundStartTime, "initialize: start time should be before end time");
    require(_roundEndTime > _applicationsStartTime, "initialize: application start time should be before end time");


    votingStrategy = _votingStrategy;
    applicationsStartTime = _applicationsStartTime;
    roundStartTime = _roundStartTime;
    roundEndTime = _roundEndTime;
    token = _token;
    roundMetaPtr = _roundMetaPtr;
    applicationMetaPtr = _applicationMetaPtr;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, _adminRole);

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

    emit RoundStartTimeUpdated(roundStartTime, _newRoundStartTime);

    roundStartTime = _newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 _newRoundEndTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundEndTime > roundStartTime, "updateRoundEndTime: end time must be after start time");

    emit RoundEndTimeUpdated(roundEndTime, _newRoundEndTime);

    roundEndTime = _newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 _newApplicationsStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newApplicationsStartTime >= roundStartTime, "applicationTime: Should be before round start time");
    require(_newApplicationsStartTime < roundEndTime, "applicationTime: Should be before round end time");

    emit ApplicationStartTimeUpdated(applicationsStartTime, _newApplicationsStartTime);

    applicationsStartTime = _newApplicationsStartTime;
  }

  /// @notice Invoked by voter to cast votes
  /// @param _encodedVotes encoded vote
  function vote(bytes[] memory _encodedVotes) public {
    votingStrategy.vote(_encodedVotes, msg.sender);
  }
}