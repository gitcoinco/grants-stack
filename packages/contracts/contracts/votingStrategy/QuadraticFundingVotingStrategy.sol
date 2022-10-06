// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IVotingStrategy.sol";

/**
 * Allows voters to cast multiple weighted votes to grants with one transaction
 * This is inspired from BulkCheckout documented over at:
 * https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol
 *
 * Emits event upon every transfer.
 */
contract QuadraticFundingVotingStrategy is IVotingStrategy, ReentrancyGuard {

  using SafeERC20 for IERC20;

  // --- Event ---

  /// @notice Emitted when a new vote is sent
  event Voted(
    IERC20  token,                    // voting token
    uint256 amount,                   // voting amount
    address indexed voter,            // voter address
    address indexed grantAddress,     // grant address
    address indexed roundAddress      // round address
  );

  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation which allows
   * a voted to cast weighted votes to multiple grants during a round
   *
   * @dev
   * - more voters -> higher the gas
   * - this would be triggered when a voter casts their vote via grant explorer
   *
   * @param encodedVotes encoded list of votes
   * @param voterAddress voter address
   */
  function vote(bytes[] calldata encodedVotes, address voterAddress) external override nonReentrant {
    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < encodedVotes.length; i++) {

      (address _token, uint256 _amount, address _grantAddress) = abi.decode(encodedVotes[i], (address, uint256, address));

      /// TODO: ensure this can be called by round only
      /// @dev erc20 transfer to grant address
      // slither-disable-next-line missing-zero-check,calls-loop,reentrancy-events,arbitrary-send-erc20
      SafeERC20.safeTransferFrom(
        IERC20(_token),
        voterAddress,
        _grantAddress,
        _amount
      );

      /// @dev emit event for transfer
      emit Voted(
        IERC20(_token),
        _amount,
        voterAddress,
        _grantAddress,
        msg.sender
      );

    }

  }
}

/// Discussion
/// - should contract should be pausable & ownable