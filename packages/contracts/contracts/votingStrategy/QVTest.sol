// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IVotingStrategy.sol";

/**
 * Allows voters to cast votes using non transferable ERC20 voting tokens
 *
 * Emits event upon every transfer.
 */
contract QuadraticVotingStrategy is IVotingStrategy, ReentrancyGuard {
  
  // --- Event ---

  /// @notice Emitted when a new vote is sent
  event Voted(
    uint256 votes,                   // votes
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
   * - this would be triggered when a voter casts their vote via round explorer
   *
   * @param encodedVotes encoded list of votes
   * @param voterAddress voter address
   */
  function vote(bytes[] calldata encodedVotes, address voterAddress) external override nonReentrant {
    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < encodedVotes.length; i++) {

      (uint256 _votes, address _grantAddress) = abi.decode(encodedVotes[i], (uint256, address));

      /// @dev erc20 transfer to grant address
      // slither-disable-next-line missing-zero-check,calls-loop,low-level-calls,reentrancy-events
      (bool success, bytes memory returndata) = _token.call(abi.encodeWithSelector(
        IERC20.burn.selector,
        voterAddress,
        _grantAddress,
        _votes
      ));

      // First, we assert that the address is a contract, since all message calls to EOAs are successful
      // Then, we assert that we get a low-level message call success (this is for non-compliant ERC20s)
      // If return data length exceeds 0, we validate it as a boolean and expect true (for compliant ERC20s)
      if (_token.code.length > 0 && success && (returndata.length == 0 || abi.decode(returndata, (bool)))) {
        /// @dev emit event for voted
        emit Voted(
          _votes,
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
