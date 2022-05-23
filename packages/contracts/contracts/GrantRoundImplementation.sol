
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./vote/IVote.sol";

/**
 * @notice Contract deployed per Grant Round
 */
contract GrantRoundImplementation is AccessControl, Initializable {

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

  // --- Data ---

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
  string public metaPtr;


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
    string memory _metaPtr,
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

  // METHODS TO UPDATE VARIABLE
}