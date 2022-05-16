
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Roles.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


/**
 * @notice Contract deployed per Grant Round 
 */
contract GrantRound {

  using Roles for Roles.Role;

  using SafeERC20 for IERC20;


  // --- Enum ---
  /**
   * @notice possible status a GrantRound is in at given point in time
   *  
   * @notice INIT : Default state on deploy
   * @notice LIVE : GrantRound is running
   * @notice END  : GrantRound has ended  
   */
  enum STATUS { INIT, LIVE, END }

  // --- Data ---

  /// @notice Accounts allowed to manage grant round
  Roles.Role private roundManagers;

  /// @notice Approved grants taking part in the round
  Roles.Role private grants;

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public immutable token;

  /// @notice URL pointing to grant round metadata (for off-chain use)
  string public metaPtr;

  /// @notice Status of the grant round
  string public status;
  

  // --- Event ---

  /// @notice Emitted when a new GrantRound status changes
  event GrantRoundStatusChange(string toStatus, address roundManager);


  // --- Core methods ---
  
  /**
   * @notice Instantiates a new grant round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _roundManagers 
   */
  constructor(
    IERC20 _token,
    string _metaPtr,
    address[] _roundManagers
  ) {


    token = _token;
    metaPtr = _metaPtr;
    status = STATUS.INIT;

    // Assigning round managers
    for (uint256 i = 0; i < _roundManagers.length; ++i) {
      roundManagers.add(_roundManagers[i]);
    }
  }


  /**
   * @notice Invoked by round manager to start grant round
   * @dev Can be invoked only by roundManagers and when the round is INIT
   */
  function startGrantRound() public only roundManagers {
    require(status == STATUS.INIT, "startGrantRound: can be invoked only when status is INIT");

    status = STATUS.LIVE;

    emit GrantRoundStatusChange(msg.sender, status);
  }

  /**
   * @notice Invoked by round manager to end grant round
   * @dev Can be invoked only by roundManagers and when the round is LIVE
   */
  function endGrantsRound() public only roundManagers {
    require(status == STATUS.LIVE, "endGrantsRound: can be invoked only when status is LIVE");

    status = STATUS.END;

    emit GrantRoundStatusChange(msg.sender, status);
  }


  // function contribute() {
  //   require(status == STATUS.LIVE, "donate: can be invoked only when grant round is LIVE");

  //   // grants.has()

  //   // TODO: check if grant is allowed and only then allow transfer
  // }
}


/**
 * Questions:
 * - Ideally contributions would go via GrantRound Contract
 * - Does it allow contributions only in the one token / any ERC20 token
 * - While unapproved grants can be maintained off chain &
 *   approval can be tracked onchain (TBD). How do we track if donation
 *   coming in is for an approved grant. We could use Role / just a mapping but
 *   imagine 500 grants be held in a mapping
 * - If we use Role then we get add remove functionality as well
 * - Once a contribution is complete -> we would emit and event
 *
 */