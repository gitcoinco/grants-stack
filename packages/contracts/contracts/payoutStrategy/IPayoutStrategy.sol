// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../utils/MetaPtr.sol";

import "../round/RoundImplementation.sol";
/**
 * @notice Defines the abstract contract for payout strategies
 * for a round. Any new payout strategy would be expected to
 * extend this abstract contract.
 * Every IPayoutStrategy contract would be unique to RoundImplementation
 * and would be deployed before creating a round 
 *
 * @dev
 *  - Deployed before creating a round
 *  - init will be invoked during round creation to link the payout
 *    strategy to the round contract 
 *  - TODO: add function distribute() to actually distribute the funds  
 */
abstract contract IPayoutStrategy {

   // --- Data ---

  /// @notice Round address
  address public roundAddress;

    /// @notice Token address
  address public tokenAddress;

  /// MetaPtr containing the distribution
  MetaPtr public distributionMetaPtr;

  // @notice
  bool public isReadyForPayout;


  /// @notice Emitted when funds are withdrawn from the payout contract
  event FundsWithdrawn(address indexed tokenAddress, uint256 amount, address withdrawAddress);

  /// @notice Emitted when contract is ready for payout
  event ReadyForPayout();

  // --- Modifier ---

  /// @notice modifier to check if sender is round contract.
  modifier isRoundContract() {
    require(roundAddress != address(0), "error: payout contract not linked to a round");
    require(msg.sender == roundAddress, "error: can be invoked only by round contract");
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
    require(block.timestamp > roundEndTime, "round has not ended");
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

  /**
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - ideally IPayoutStrategy implementation should emit events after 
   *   distribution is updated
   * - would be invoked at the end of the round
   *
   * @param _encodedDistribution encoded distribution
   */
  function updateDistribution(bytes calldata _encodedDistribution) external virtual;

    /// @notice checks that distribution is set before setReadyForPayout
  function isDistributionSet() public virtual view returns (bool);

    /// @notice Invoked by RoundImplementation to set isReadyForPayout
  function setReadyForPayout() external payable isRoundContract roundHasEnded {
    require(isReadyForPayout == false, "isReadyForPayout already set");
    require(isDistributionSet(), "distribution not set");

    isReadyForPayout = true;
    emit ReadyForPayout();
  }

  /**
   * @notice Invoked by RoundImplementation to withdraw funds to
   * withdrawAddress from the payout contract
   *
   * @param withdrawAddress withdraw funds address
   */
  function withdrawFunds(address payable withdrawAddress) external payable virtual isRoundOperator roundHasEnded {

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
