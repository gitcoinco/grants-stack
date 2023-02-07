// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../utils/MetaPtr.sol";

import "../round/RoundImplementation.sol";

/**
 * @notice Defines the abstract contract for payout strategies
 * for a round. Any new payout strategy would be expected to
 * extend this abstract contract.
 * Every PayoutStrategyImplementation contract would be unique to RoundImplementation
 * and would be deployed before creating a round.
 *
 * Functions that are marked as `virtual` are expected to be overridden
 * by the implementation contract.
 *
 * - updateDistribution
 * - payout
 *
 * @dev
 *  - Deployed before creating a round
 *  - Funds are transferred to the payout contract from round only during payout
 */
abstract contract IPayoutStrategy {

  using SafeERC20Upgradeable for IERC20Upgradeable;

  // --- Constants ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

  /// @notice Locking duration
  uint256 public constant LOCK_DURATION = 60 days;

  // --- Data ---

  /// @notice RoundImplementation address
  address public roundAddress;

  /// @notice Token address
  address public tokenAddress;

  /// MetaPtr containing the distribution
  MetaPtr public distributionMetaPtr;

  /// @notice End locking time
  uint256 public endLockingTime;

  // --- Event ---

  /// @notice Emitted when funds are withdrawn from the payout contract
  event FundsWithdrawn(address indexed tokenAddress, uint256 amount);

  // --- Modifier ---

  /// @notice modifier to check if sender is round contract.
  modifier isRoundContract() {
    require(roundAddress != address(0), "error: voting contract not linked to a round");
    require(msg.sender == roundAddress, "error: can be invoked only by round contract");
    _;
  }

  /// @notice modifier to check if sender is round operator.
  modifier isRoundOperator() {
    require(
      RoundImplementation(roundAddress).hasRole(ROUND_OPERATOR_ROLE, msg.sender),
      "error: not round operator"
    );
    _;
  }

  /// @notice modifier to check if round has ended.
  modifier roundHasEnded() {
    uint roundEndTime = RoundImplementation(roundAddress).roundEndTime();
    require(block.timestamp >= roundEndTime,"error: round has not ended");
    _;
  }

  /// @notice modifier to check if lock duration has ended.
  modifier timelockHasEnded() {
    uint roundEndTime = RoundImplementation(roundAddress).roundEndTime();
    require(roundEndTime >= LOCK_DURATION, "error: lockDuation not ended.");
    _;
  }

  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation on creation to
   * set the round for which the payout strategy is to be used
   *
   */
  function init() external {
    require(roundAddress == address(0x0), "init: roundAddress already set");
    roundAddress = msg.sender;

    // set the end locking time
    uint roundEndTime = RoundImplementation(roundAddress).roundEndTime();
    endLockingTime = roundEndTime + LOCK_DURATION;
  }

  /**s
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - ideally IPayoutStrategy implementation should emit events after
   *   distribution is updated
   * - would be invoked at the end of the round
   *
   * Modifiers:
   *  - isRoundOperator
   *  - roundHasEnded
   *
   * @param _encodedDistribution encoded distribution
   */
  function updateDistribution(bytes calldata _encodedDistribution) external virtual;

  /**
   * @notice Invoked by RoundImplementation to trigger payout
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - could be used to trigger payout / enable payout
   * - ideally IPayoutStrategy implementation should emit events after
   *   payout is triggered
   *
   * Modifiers:
   *  - isRoundOperator
   *  - roundHasEnded
   *
   * @param _encodedPayoutData encoded payout data
   */
  function payout(bytes[] calldata _encodedPayoutData) external virtual payable;

  /**
   * @notice Invoked by RoundImplementation to withdraw funds to
   * withdrawFundsAddress from the payout contract
   *
   * @param withdrawFundsAddress withdraw funds address
   */
  function withdrawFunds(address payable withdrawFundsAddress) external virtual isRoundOperator timelockHasEnded {

    uint balance = _getTokenBalance();

    if (tokenAddress == address(0)) { /// @dev native token

      AddressUpgradeable.sendValue(
        withdrawFundsAddress,
        balance
      );

      emit FundsWithdrawn(tokenAddress, balance);

    } else { /// @dev ERC20 token

      IERC20Upgradeable(tokenAddress).safeTransfer(
        withdrawFundsAddress,
        balance
      );

      emit FundsWithdrawn(tokenAddress, balance);
    }

  }

  /**
   * Util function to get token balance in the contract
   */
  function _getTokenBalance() private view returns (uint) {
    if (tokenAddress == address(0)) {
      return address(this).balance;
    } else {
      return IERC20Upgradeable(tokenAddress).balanceOf(address(this));
    }
  }

}
