// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../IPayoutStrategy.sol";
import "../../utils/MetaPtr.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";


/**
 * @notice Merkle Payout Strategy contract which is deployed once per round
 * and is used to upload the final match distribution.
 *
 */
contract MerklePayoutStrategyImplementation is IPayoutStrategy, Initializable {

  string public constant VERSION = "0.2.0";

  // --- Data ---

  /// @notice Unix timestamp from when round can accept applications
  bytes32 public merkleRoot;

  mapping(uint256 => uint256) private distributedBitMap;


  // --- Event ---

  /// @notice Emitted when the distribution is updated
  event DistributionUpdated(bytes32 merkleRoot, MetaPtr distributionMetaPtr);

  /// @notice Emitted when funds are reclaimed
  event ReclaimFunds(address indexed sender, IERC20 indexed token, uint256 indexed amount);

  /// @notice Emitted when batch payout is triggered
  event BatchPayoutTriggered(address indexed sender);


  function initialize() external initializer {
    // empty initializer
  }

  // --- Core methods ---

  /**
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - ideally IPayoutStrategy implementation should emit events after
   *   distribution is updated
   * - would be invoked at the end of the round
   *
   * @param encodedDistribution encoded distribution
   */
  function updateDistribution(bytes calldata encodedDistribution) external override roundHasEnded isRoundOperator {

    (bytes32 _merkleRoot, MetaPtr memory _distributionMetaPtr) = abi.decode(
      encodedDistribution,
      (bytes32, MetaPtr)
    );

    merkleRoot = _merkleRoot;
    distributionMetaPtr = _distributionMetaPtr;

    emit DistributionUpdated(merkleRoot, distributionMetaPtr);
  }


   /**
   * @notice Invoked by RoundImplementation to upload distribution to the
   * payout strategy
   *
   * @dev
   * - should be invoked by RoundImplementation contract
   * - ideally IPayoutStrategy implementation should emit events after
   *   payout is complete
   * - would be invoked at the end of the round
   *
   * @param encodedDistribution encoded distribution
   */
  function batchPayout(Distribution[] calldata _distributions) external override isRoundContract payable { 

    for (uint256 i = 0; i < _distributions.length; ++i) {
        distribute(_distributions[i]);
    }

    emit BatchPayoutTriggered(msg.sender);
  }

  function distribute(Distribution calldata _distribution) public {

    uint256 _index = _distribution.index;
    address _grantee = _distribution._grantee;
    uint256 _amount = _distribution.amount;
    bytes32[] calldata _merkleProof = _distribution.merkleProof;

    require(!hasDistributed(_index), "MerklePayout: Funds already distributed.");

    bytes32 node = keccak256(abi.encodePacked(_index, _grantee, _amount));
    require(MerkleProof.verify(_merkleProof, merkleRoot, node), "MerklePayout: Invalid proof.");

    _setDistributed(_index);
    token.safeTransfer(_claimee, _amount);

    emit FundsDistributed(_index, _grantee, _amount);
  }

  function hasDistributed(uint256 _index) public view returns (bool) {

    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    uint256 distributedWord = distributedBitIndex[distributedWordIndex];
    uint256 mask = (1 << distributedBitIndex);

    return distributedWord & mask == mask;
  }

  function _setDistributed(uint256 _index) private {
    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    distributedBitMap[distributedWordIndex] |= (1 << distributedBitIndex);
  }


}