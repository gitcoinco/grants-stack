
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";



/**
 * @notice Contract deployed per Grant Round
 */
contract GrantRound is AccessControl, ReentrancyGuard {

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

  // --- Enum ---

  /// @notice possible status a GrantRound is in at given point in time
  enum STATUS {
    INIT, // Default state on deploy
    LIVE, // GrantRound is running
    END   // GrantRound has ended
  }

  // --- Data ---

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public immutable token;

  /// @notice URL pointing to grant round metadata (for off-chain use)
  string public metaPtr;

  /// @notice Status of the grant round
  STATUS public status;

  /// @notice Contribution object
  struct Contribution {
    IERC20 token;           // contibuting token
    uint256 amount;         // contributing amount
    address grantAddress;   // grant address
  }

  // --- Event ---

  /// @notice Emitted when a new GrantRound status changes
  event GrantRoundStatusChange(STATUS toStatus, address roundManager);

  /// @notice Emitted when a new contribution is sent
  event ContributionMade(
    IERC20 indexed token,         // contibuting token
    uint256 amount,               // contibuting amount
    address indexed grantAddress, // contributing token
    address indexed contributor   // contributor address
  );

  // --- Core methods ---

  /**
   * @notice Instantiates a new grant round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  constructor(
    IERC20 _token,
    string memory _metaPtr,
    address[] memory _roundOperators
  ) {

    token = _token;
    metaPtr = _metaPtr;
    status = STATUS.INIT;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Assigning round operators
    for (uint256 i = 0; i < _roundOperators.length; ++i) {
      _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
    }
  }


  /**
   * @notice Invoked by round manager to start grant round
   * @dev Can be invoked only by roundOperators and when the round is INIT
   */
  function startGrantRound() public onlyRole(ROUND_OPERATOR_ROLE) {
    require(status == STATUS.INIT, "startGrantRound: can be invoked only when status is INIT");

    status = STATUS.LIVE;

    emit GrantRoundStatusChange(status, msg.sender);
  }

  /**
   * @notice Invoked by round manager to end grant round
   * @dev Can be invoked only by roundOperators and when the round is LIVE
   */
  function endGrantsRound() public onlyRole(ROUND_OPERATOR_ROLE) {
    require(status == STATUS.LIVE, "endGrantsRound: can be invoked only when status is LIVE");

    status = STATUS.END;

    emit GrantRoundStatusChange(status, msg.sender);
  }


  /**
   * @notice Invoked by contributor to contribute to grants
   *
   * @dev
   * - allows contributor to do a bulk contributions.
   * - more contributions -> higher the gas
   * - can be invoked only when round is LIVE
   * - expected to be invoked from the round explorer
   *
   * @param _contributions list of contirbutions
   */
  function contribute(Contribution[] calldata _contributions) external payable nonReentrant {
    require(status == STATUS.LIVE, "contribute: can be invoked only when status is LIVE");

    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < _contributions.length; i++) {

      /// @dev erc20 transfer to grant address
      SafeERC20.safeTransferFrom(
        _contributions[i].token,
        msg.sender,
        _contributions[i].grantAddress,
        _contributions[i].amount
      );

      /// @dev emit event once transfer is done
      emit ContributionMade(
        _contributions[i].token,
        _contributions[i].amount,
        _contributions[i].grantAddress,
        msg.sender
      );
    }

  }
}