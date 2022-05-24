// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// @notice Vote object
struct Vote {
  address token;              // voting token
  uint256 amount;             // voting amount
  address grantAddress;       // voter address
  address voterAddress;       // voter address
}
