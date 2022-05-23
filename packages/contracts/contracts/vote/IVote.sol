// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../utils/Vote.sol";

interface IVote {
  
  // --- Core methods ---

  /**
   * @notice Invoked by contributor to contribute to grants
   *
   * @dev
   * - allows contributor to do a bulk support.
   * - more contributions -> higher the gas
   * - can be invoked only when round is LIVE
   * - expected to be invoked from the round explorer
   *
   * @param _votes list of votes
   */
  function vote(Vote[] calldata _votes, address grantRoundAddress) external;
}