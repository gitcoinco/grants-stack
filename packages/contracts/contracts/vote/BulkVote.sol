// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IVote.sol";


contract BulkVote is IVote, ReentrancyGuard {
  
  // --- Data ---

  /// @notice Unix timestamp of the start of the round
  uint256 public roundStartTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public roundEndTime;


  // --- Event ---

  /// @notice Emitted when a new vote is sent
  event Voted(
    IERC20  token,                // voting token
    uint256 amount,               // voting amount
    address indexed grantAddress, // grant address
    address indexed voter,        // voter address
    address indexed grantRoundAddress    // grant round address
  );

  // --- Core methods ---

  /**
   * @notice Instantiates a new BulkVote
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   */
  constructor(
    uint256 _roundStartTime,
    uint256 _roundEndTime
  ) {

    require(_roundStartTime >= block.timestamp, "BulkVote: Start time has already passed");
    require(_roundStartTime < _roundEndTime , "BulkVote: End time must be after start time");

    roundStartTime = _roundStartTime;
    roundEndTime = _roundEndTime;
  }


  /**
   * @notice Invoked by voter to contribute to grants
   *
   * @dev
   * - allows voters to do a bulk votes.
   * - more contributions -> higher the gas
   * - expected to be invoked from the round explorer
   *
   * @param _votes list of votes
   */
  function vote(Vote[] calldata _votes, address grantRoundAddress) public override nonReentrant {

    require(block.timestamp >= roundStartTime, "BulkVote: Round has not started");
    require(block.timestamp <= roundEndTime, "BulkVote: Round has ended");

    /// @dev iterate over multiple donations and transfer funds
    for (uint256 i = 0; i < _votes.length; i++) {

      /// @dev erc20 transfer to grant address
      SafeERC20.safeTransferFrom(
        IERC20(_votes[i].token),
        msg.sender,
        _votes[i].grantAddress,
        _votes[i].amount
      );

      /// @dev emit event once transfer is done
      emit Voted(
        IERC20(_votes[i].token),
        _votes[i].amount,
        _votes[i].grantAddress,
        msg.sender,
        grantRoundAddress
      );
    }

  }
}