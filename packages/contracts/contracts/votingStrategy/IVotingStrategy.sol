// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Defines the interface for voting algorithms on grants
 * within a round. Any new voting algorithm would be expected to
 * implement this interface.
 * Every IVotingStrategy implementation would ideally be deployed once per chain
 * and be invoked by the RoundImplementation contract
 *
 */
interface IVotingStrategy {

  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation to allow voter to case
   * vote for grants during a round.
   *
   * @dev
   * - allows contributor to do cast multiple votes which could be weighted.
   * - should be invoked by RoundImplementation contract
   * - ideally IVotingStrategy implementation should emit events after a vote is cast
   * - this would be triggered when a voter casts their vote via round explorer
   *
   * @param _encodedVotes encoded votes
   * @param _voterAddress voter address
   */
  function vote(bytes[] calldata _encodedVotes, address _voterAddress) external;
}
