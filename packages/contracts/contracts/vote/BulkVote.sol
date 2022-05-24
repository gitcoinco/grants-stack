// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IVote.sol";

/**
 * Allows voters to cast multiple weighted votes to grants with one transaction
 * This is inspired from BulkCheckout documented over at:
 * https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol
 *
 * Emits event upon every transfer.
 */
contract BulkVote is IVote, ReentrancyGuard {
  
  // --- Event ---

  /// @notice Emitted when a new vote is sent
  event Voted(
    IERC20  token,                    // voting token
    uint256 amount,                   // voting amount
    address indexed voter,            // voter address
    address indexed grantAddress,     // grant address
    address indexed grantRoundAddress // grant round address
  );

  // --- Core methods ---

  /**
   * @notice Invoked by GrantRoundImplementation which allows
   * a voted to cast weighted votes to multiple grants during a
   * grant round
   *
   * @dev
   * - more voters -> higher the gas
   * - his would be triggered when a voter casts their vote via round explorer
   *
   * @param _votes list of votes
   */
  function vote(Vote[] calldata _votes) external override nonReentrant {

    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < _votes.length; i++) {

      /// @dev erc20 transfer to grant address
      SafeERC20.safeTransferFrom(
        IERC20(_votes[i].token),
        _votes[i].voterAddress,
        _votes[i].grantAddress,
        _votes[i].amount
      );

      /// @dev emit event once transfer is done
      emit Voted(
        IERC20(_votes[i].token),
        _votes[i].amount,
        _votes[i].voterAddress,
        _votes[i].grantAddress,
        msg.sender
      );
    }

  }
}