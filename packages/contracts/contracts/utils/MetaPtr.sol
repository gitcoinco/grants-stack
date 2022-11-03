// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

struct MetaPtr {

  /// @notice Protocol ID corresponding to a specific protocol.
  /// More info at https://github.com/gitcoinco/grants-round/tree/main/packages/contracts/docs/MetaPtrProtocol.md
  uint256 protocol;
  
  /// @notice Pointer to fetch metadata for the specified protocol
  string pointer;
}