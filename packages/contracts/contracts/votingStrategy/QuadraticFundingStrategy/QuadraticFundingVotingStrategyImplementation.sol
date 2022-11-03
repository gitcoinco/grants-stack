// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../IVotingStrategy.sol";

/**
 * Allows voters to cast multiple weighted votes to grants with one transaction
 * This is inspired from BulkCheckout documented over at:
 * https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol
 *
 * Emits event upon every transfer.
 */
contract QuadraticFundingVotingStrategyImplementation is IVotingStrategy, ReentrancyGuard, Initializable {

  using SafeERC20Upgradeable for IERC20Upgradeable;

  // --- Event ---

  /// @notice Emitted when a new vote is sent
  event Voted(
    address  token,                   // voting token
    uint256 amount,                   // voting amount
    address indexed voter,            // voter address
    address indexed grantAddress,     // grant address
    address indexed roundAddress      // round address
  );

  // --- Core methods ---

  function initialize() external initializer {
    // empty initializer
  }

  /**
   * @notice Invoked by RoundImplementation which allows
   * a voted to cast weighted votes to multiple grants during a round
   *
   * @dev
   * - more voters -> higher the gas
   * - this would be triggered when a voter casts their vote via grant explorer
   * - can be invoked by the round
   * - supports ERC20 and Native token transfer
   *
   * @param encodedVotes encoded list of votes
   * @param voterAddress voter address
   */
  function vote(bytes[] calldata encodedVotes, address voterAddress) external override payable nonReentrant isRoundContract {

    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < encodedVotes.length; i++) {

      (address _token, uint256 _amount, address _grantAddress) = abi.decode(encodedVotes[i], (address, uint256, address));

      if (_token == address(0)) {
        /// @dev native token transfer to grant address
        // slither-disable-next-line reentrancy-events
        AddressUpgradeable.sendValue(payable(_grantAddress), _amount);
      } else {

        /// @dev erc20 transfer to grant address
        // slither-disable-next-line arbitrary-send-erc20,reentrancy-events,
        SafeERC20Upgradeable.safeTransferFrom(
          IERC20Upgradeable(_token),
          voterAddress,
          _grantAddress,
          _amount
        );

      }

      /// @dev emit event for transfer
      emit Voted(
        _token,
        _amount,
        voterAddress,
        _grantAddress,
        msg.sender
      );

    }

  }
}