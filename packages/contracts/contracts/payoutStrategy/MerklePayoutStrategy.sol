// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "../payoutStrategy/IPayoutStrategy.sol";

import "../utils/MetaPtr.sol";

/**
 * @notice Merkle Payout Strategy contract which is deployed once per round
 * and is used to upload the final match distribution.
 *
 * @dev
 *  - TODO: add function distribute() to actually distribute the funds
 */
contract MerklePayoutStrategy is IPayoutStrategy {

  // --- Data ---

  /// @notice Unix timestamp from when round can accept applications
  bytes32 public merkleRoot;

  /// @notice Unix timestamp from when round stops accepting applications
  MetaPtr public distributionMetaPtr;


  // --- Event ---

  /// @notice Emitted when the distribution is updated
  event DistributionUpdated(bytes32 merkleRoot, MetaPtr distributionMetaPtr);


  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - ideally IPayoutStrategy implementation should emit events after
   *   distribution is updated
   * - would be invoked at the end of the roune
   *
   * @param encodedDistribution encoded distribution
   */
  function updateDistribution(bytes calldata encodedDistribution) external override isRoundContract {

    (bytes32 _merkleRoot, MetaPtr memory _distributionMetaPtr) = abi.decode(
      encodedDistribution,
      (bytes32, MetaPtr)
    );

    merkleRoot = _merkleRoot;
    distributionMetaPtr = _distributionMetaPtr;

    emit DistributionUpdated(merkleRoot, distributionMetaPtr);
  }

  // TODO: function payout()
}