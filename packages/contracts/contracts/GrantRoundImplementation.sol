
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./vote/IVote.sol";

import "./utils/MetaPtr.sol";

/**
 * @notice Contract deployed per Grant Round which would managed by
 * a group of ROUND_OPERATOR via the GrantRoundFactory
 *
 */
contract GrantRoundImplementation is AccessControl, Initializable {

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");


  // --- Events ---

  /// @notice Emitted when a grant round metadata pointer is updated
  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when a grant round timings are updated
  event TimeUpdated(string typeOfTime, uint256 oldTime, uint256 newTime);


  // --- Data ---

  /// @notice Voting Contract Address
  IVote public votingContract;

  /// @notice Unix timestamp after where grants can apply
  uint256 public grantApplicationsStartTime;

  /// @notice Unix timestamp of the start of the round
  uint256 public roundStartTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public roundEndTime;

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public token;

  /// @notice URL pointing to grant round metadata (for off-chain use)
  MetaPtr public metaPtr;


  // --- Core methods ---

  /**
   * @notice Instantiates a new grant round
   * @param _votingContract Deployed Voting Contract
   * @param _grantApplicationsStartTime Unix timestamp from when grants can apply
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function initialize(
    IVote _votingContract,
    uint256 _grantApplicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    MetaPtr memory _metaPtr,
    address[] memory _roundOperators
  ) public initializer {

    votingContract = _votingContract;
    grantApplicationsStartTime = _grantApplicationsStartTime;
    roundStartTime = _roundStartTime;
    roundEndTime = _roundEndTime;
    token = _token;
    metaPtr = _metaPtr;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

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

    require(_newRoundStartTime >= block.timestamp, "updateRoundStartTime: Start time has already passed");

    emit TimeUpdated("roundStartTime", roundStartTime, _newRoundStartTime);

    roundStartTime = _newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 _newRoundEndTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newRoundEndTime > roundStartTime, "updateRoundEndTime: End time must be after start time");

    emit TimeUpdated("roundEndTime", roundEndTime, _newRoundEndTime);

    roundEndTime = _newRoundEndTime;
  }

  /// @notice Update grantApplicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param _newGrantApplicationsStartTime new grantApplicationsStartTime
  function updateGrantApplicationsStartTime(uint256 _newGrantApplicationsStartTime) public onlyRole(ROUND_OPERATOR_ROLE) {

    require(_newGrantApplicationsStartTime >= roundStartTime, "grantApplicationTime: Should be before round start time");
    require(_newGrantApplicationsStartTime < roundEndTime, "grantApplicationTime: Should be before round end time");

    emit TimeUpdated("grantApplicationsStartTime", grantApplicationsStartTime, _newGrantApplicationsStartTime);

    grantApplicationsStartTime = _newGrantApplicationsStartTime;
  }

  /// @notice Invoked by voter to cast votes
  /// @param _votes list of votes
  function vote(Vote[] calldata _votes) public {
    votingContract.vote(_votes);
  }
}

/**
 * Debate need for
 * - updateToken(IERC20 token)
 * - updateVotingContract(address _votingContract)
 * - using generic TimeUpdated event / have unique event
 */