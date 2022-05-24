// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "../utils/Vote.sol";

/**
 * @notice Defines the interface for voting algorithms on grants
 * within a round. Any new voting algorithm would be expected to
 * implement this interface.
 * Every IVote implementation would ideally be deployed once per chain
 * and be invoked by the GrantRoundImplementation contract
 *
 */
interface IVote {

  // --- Core methods ---

  /**
   * @notice Invoked by GrantRoundImplementation to allow voter to case
   * vote for grants during a grant round.
   *
   * @dev
   * - allows contributor to do cast multiple votes which could be weighted.
   * - should be invoked by GrantRoundImplementation contract
   * - ideally IVote implementation should emit events after a vote is cast
   * - this would be triggered when a voter casts their vote via round explorer
   *
   * @param _votes list of votes
   */
  function vote(Vote[] calldata _votes) external;
}