
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./vote/IVote.sol";

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

  /// @notice Emitted when a round metadata pointer is updated
  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when a round timings are updated
  event TimeUpdated(string typeOfTime, uint256 oldTime, uint256 newTime);


  // --- Data ---

  /// @notice Voting Contract Address
  IVote public votingContract;

  /// @notice Unix timestamp from when round can accept applications
  uint256 public applicationsStartTime;

  /// @notice Unix timestamp of the start of the round
  uint256 public roundStartTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public roundEndTime;

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public token;

  /// @notice URL pointing to round metadata (for off-chain use)
  MetaPtr public metaPtr;


  // --- Core methods ---

  /**
   * @notice Instantiates a new round
   * @param _votingContract Deployed Voting Contract
   * @param _applicationsStartTime Unix timestamp from when round can accept applications
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _metaPtr URL pointing to the round metadata
   * @param _adminRole Address to be granted DEFAULT_ADMIN_ROLE
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function initialize(
    IVote _votingContract,
    uint256 _applicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    MetaPtr memory _metaPtr,
    address _adminRole,
    address[] memory _roundOperators
  ) public initializer {

    require(_roundStartTime >= block.timestamp, "initialize: start time has already passed");
    require(_roundEndTime > _roundStartTime, "initialize: start time should be before end time");
    require(_roundEndTime > _applicationsStartTime, "initialize: application start time should be before end time");


    votingContract = _votingContract;
    applicationsStartTime = _applicationsStartTime;
    roundStartTime = _roundStartTime;
    roundEndTime = _roundEndTime;
    token = _token;
    metaPtr = _metaPtr;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, _adminRole);

    // Assigning round operators
    for (uint256 i = 0; i < _roundOperators.length; ++i) {
      _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
    }
  }

  // @notice Update metaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param _newMetaPtr new metaPtr
  function updateMetaPtr(MetaPtr memory _newMetaPtr) public onlyRole(ROUND_OPERATOR_ROLE) {
    emit MetadataUpdated(metaPtr, _newMetaPtr);
    metaPtr = _newMetaPtr;
  }

  /// @notice Update roundStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundStartTime new roundStartTime
  function updateRoundStartTime(uint256 _newRoundStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundStartTime >= block.timestamp, "updateRoundStartTime: start time has already passed");

    emit TimeUpdated("roundStartTime", roundStartTime, _newRoundStartTime);

    roundStartTime = _newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 _newRoundEndTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundEndTime > roundStartTime, "updateRoundEndTime: end time must be after start time");

    emit TimeUpdated("roundEndTime", roundEndTime, _newRoundEndTime);

    roundEndTime = _newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 _newApplicationsStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newApplicationsStartTime >= roundStartTime, "applicationTime: Should be before round start time");
    require(_newApplicationsStartTime < roundEndTime, "applicationTime: Should be before round end time");

    emit TimeUpdated("applicationsStartTime", applicationsStartTime, _newApplicationsStartTime);

    applicationsStartTime = _newApplicationsStartTime;
  }

  /// @notice Invoked by voter to cast votes
  /// @param _votes list of votes
  function vote(Vote[] calldata _votes) public {
    votingContract.vote(_votes);
  }
}

/**
 * Debate need for
 * - using generic TimeUpdated event / have unique event
 */