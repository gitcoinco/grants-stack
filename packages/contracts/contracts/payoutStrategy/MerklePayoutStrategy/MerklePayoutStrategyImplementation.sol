// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../../utils/MetaPtr.sol";
import "../IPayoutStrategy.sol";

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
  event ReclaimFunds(address indexed sender, address indexed token, uint256 indexed amount);

  /// @notice Emitted when funds are distributed
  event FundsDistributed(address indexed sender, address indexed grantee, address indexed token, uint256 amount);

  /// @notice Emitted when batch payout is triggered
  event BatchPayoutTriggered(address indexed sender);

  // --- Types ---
  struct Distribution {
    uint256 index;
    address _grantee;
    uint256 amount;
    bytes32[] merkleProof;
  }


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

  // TODO: Document this function
  // CHECK: Function signature, should this only be callable by the round operator?
  // NOTE: payout must be defined to satisfy the IPayoutStrategy interface 
  //       so this implements the batch payout functionality
  function payout(bytes[] calldata _distributions) external virtual override payable  {

    for (uint256 i = 0; i < _distributions.length; ++i) {
        _distribute(_distributions[i]);
    }

    emit BatchPayoutTriggered(msg.sender);
  }

  // TODO: Document this function
  // CHECK: Function signature
  // TODO: Check where tokens and eth are living before proceeding
  function _distribute(bytes calldata _distribution) internal isRoundContract {
    
    Distribution memory distribution = abi.decode(_distribution, (Distribution));

    uint256 _index = distribution.index;
    address _grantee = distribution._grantee;
    uint256 _amount = distribution.amount;
    bytes32[] memory _merkleProof = distribution.merkleProof;

    require(!hasDistributed(_index), "MerklePayout: Funds already distributed.");

    bytes32 node = keccak256(abi.encodePacked(_index, _grantee, _amount));
    require(MerkleProof.verify(_merkleProof, merkleRoot, node), "MerklePayout: Invalid proof.");

    _setDistributed(_index);

    if (tokenAddress == address(0)) {
      // if token is ETH
    } else {
      // if token is ERC20
     // token.safeTransfer(_grantee, _amount);
    }

    emit FundsDistributed(msg.sender, _grantee, tokenAddress, _amount);
  }


  function hasDistributed(uint256 _index) public view returns (bool) {

    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    uint256 distributedWord = distributedBitMap[distributedWordIndex];
    uint256 mask = (1 << distributedBitIndex);

    return distributedWord & mask == mask;
  }

  function _setDistributed(uint256 _index) private {
    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    distributedBitMap[distributedWordIndex] |= (1 << distributedBitIndex);
  }

}

