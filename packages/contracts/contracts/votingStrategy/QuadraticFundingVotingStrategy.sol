// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IVotingStrategy.sol";

/**
 * Allows voters to cast multiple weighted votes to grants with one transaction
 * This is inspired from BulkCheckout documented over at:
 * https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol
 *
 * Emits event upon every transfer.
 */
contract QuadraticFundingVotingStrategy is IVotingStrategy, ReentrancyGuard {
  
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

      /// @dev erc20 transfer to grant address
      // slither-disable-next-line missing-zero-check,calls-loop,low-level-calls,reentrancy-events
      (bool success, bytes memory returndata) = _token.call(abi.encodeWithSelector(
        IERC20.transferFrom.selector,
        voterAddress,
        _grantAddress,
        _amount
      ));

      // This is a non-reverting version of safeTransferFrom()
      // First, we assert that the address is a contract, since all message calls to EOAs are successful
      // Then, we assert that we get a low-level message call success (this is for non-compliant ERC20s)
      // If return data length exceeds 0, we validate it as a boolean and expect true (for compliant ERC20s)
      if (_token.code.length > 0 && success && (returndata.length == 0 || abi.decode(returndata, (bool)))) {
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
}

/// Discussion
/// - should contract should be pausable & ownable
