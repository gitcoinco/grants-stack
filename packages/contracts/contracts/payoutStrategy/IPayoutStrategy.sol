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
  uint256 public constant LOCK_DURATION = 0 days;

  // --- Data ---

  /// @notice RoundImplementation address
  address payable public roundAddress;

  /// @notice Token address
  address public tokenAddress;

  /// MetaPtr containing the distribution
  MetaPtr public distributionMetaPtr;

  // @notice
  bool public isReadyForPayout;

  // --- Event ---

  /// @notice Emitted when funds are withdrawn from the payout contract
  event FundsWithdrawn(address indexed tokenAddress, uint256 amount, address withdrawAddress);

  /// @notice Emitted when contract is ready for payout
  event ReadyForPayout();

  // --- Modifier ---

  /// @notice modifier to check if sender is round contract.
  modifier isRoundContract() {
    require(roundAddress != address(0), "not linked to a round");
    require(msg.sender == roundAddress, "not invoked by round");
    _;
  }

  /// @notice modifier to check if sender is round operator.
  modifier isRoundOperator() {
    require(
      RoundImplementation(roundAddress).hasRole(ROUND_OPERATOR_ROLE, msg.sender),
      "not round operator"
    );
    _;
  }

  /// @notice modifier to check if round has ended.
  modifier roundHasEnded() {
    uint roundEndTime = RoundImplementation(roundAddress).roundEndTime();
    require(block.timestamp >= roundEndTime,"round has not ended");
    _;
  }

  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation on creation to
   * set the round for which the payout strategy is to be used
   *
   */
  function init() external {
    require(roundAddress == address(0x0), "roundAddress already set");
    roundAddress = payable(msg.sender);

    // set the token address
    tokenAddress = RoundImplementation(roundAddress).token();

    isReadyForPayout = false;
  }

  /**s
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
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

  /// @notice Invoked by RoundImplementation to set isReadyForPayout
  function setReadyForPayout() external payable isRoundContract roundHasEnded {
    require(isReadyForPayout == false, "isReadyForPayout already set");
    isReadyForPayout = true;
    emit ReadyForPayout();
  }

  /**
   * @notice Invoked by RoundImplementation to trigger payout
   *
   * @dev
   * - could be used to trigger payout / enable payout
   * - should be invoked only when isReadyForPayout is ttue
   * - should emit event after every payout is triggered
   *
   * @param _encodedPayoutData encoded payout data
   */
  function payout(bytes[] calldata _encodedPayoutData) external virtual payable;

  /**
   * @notice Invoked by RoundImplementation to withdraw funds to
   * withdrawAddress from the payout contract
   *
   * @param withdrawAddress withdraw funds address
   */
  function withdrawFunds(address payable withdrawAddress) external payable virtual isRoundOperator {

    uint roundEndTime = RoundImplementation(roundAddress).roundEndTime();
    require(block.timestamp >= roundEndTime + LOCK_DURATION, "Lock duration has not ended");


    uint balance = _getTokenBalance();

    if (tokenAddress == address(0)) { 
      /// @dev native token
      AddressUpgradeable.sendValue(
        withdrawAddress,
        balance
      );
    } else { 
      /// @dev ERC20 token
      IERC20Upgradeable(tokenAddress).safeTransfer(
        withdrawAddress,
        balance
      );
    }

    emit FundsWithdrawn(tokenAddress, balance, withdrawAddress);
  }

  /**
   * Util function to get token balance in the contract
   */
  function _getTokenBalance() internal view returns (uint) {
    if (tokenAddress == address(0)) {
      return address(this).balance;
    } else {
      return IERC20Upgradeable(tokenAddress).balanceOf(address(this));
    }
  }

  receive() external payable {}
}
