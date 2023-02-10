// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

  using SafeERC20 for IERC20;

  // --- Data ---

  /// @notice merkle root generated from distribution
  bytes32 public merkleRoot;

  /// @notice packed array of booleans to keep track of claims
  mapping(uint256 => uint256) private distributedBitMap;


  // --- Events ---

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
   * @notice Invoked by round operator to update the
   * - merkle root
   * - distribution MetaPtr
   *
   * @param encodedDistribution encoded distribution
   */
  function updateDistribution(bytes calldata encodedDistribution) external override roundHasEnded isRoundOperator {

    require(isReadyForPayout == false, "already ready for payout");

    (bytes32 _merkleRoot, MetaPtr memory _distributionMetaPtr) = abi.decode(
      encodedDistribution,
      (bytes32, MetaPtr)
    );

    merkleRoot = _merkleRoot;
    distributionMetaPtr = _distributionMetaPtr;

    emit DistributionUpdated(merkleRoot, distributionMetaPtr);
  }

  /// @notice Util function to check if distribution is done
  /// @param _index index of the distribution
  function hasDistributed(uint256 _index) public view returns (bool) {

    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    uint256 distributedWord = distributedBitMap[distributedWordIndex];
    uint256 mask = (1 << distributedBitIndex);

    return distributedWord & mask == mask;
  }

  /**
   * @notice MerklePayoutStrategy implementation of payout
   * Can be invoked only by round operator and isReadyForPayout is true
   *
   * @param _distributions encoded distributions
   */
  function payout(bytes[] calldata _distributions) external virtual override payable isRoundOperator {

    require(isReadyForPayout == true, "not ready for payout");

    for (uint256 i = 0; i < _distributions.length; ++i) {
      _distribute(_distributions[i]);
    }

    emit BatchPayoutTriggered(msg.sender);
  }

  /// @notice Util function to distribute funds to recipient
  /// @param _distribution encoded distribution
  function _distribute(bytes calldata _distribution) private {
    
    Distribution memory distribution = abi.decode(_distribution, (Distribution));

    uint256 _index = distribution.index;
    address _grantee = distribution._grantee;
    uint256 _amount = distribution.amount;
    bytes32[] memory _merkleProof = distribution.merkleProof;

    require(!hasDistributed(_index), "funds already distributed");

    bytes32 node = keccak256(abi.encodePacked(_index, _grantee, _amount));
    require(MerkleProof.verify(_merkleProof, merkleRoot, node), "MerklePayout: Invalid proof.");

    _setDistributed(_index);

    _transferAmount(payable(_grantee), _amount);

    emit FundsDistributed(msg.sender, _grantee, tokenAddress, _amount);
  }

  /// @notice Util function to mark distribution as done
  /// @param _index index of the distribution
  function _setDistributed(uint256 _index) private {
    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    distributedBitMap[distributedWordIndex] |= (1 << distributedBitIndex);
  }

  /// @notice Util function to transfer amount to recipient
  /// @param _recipient recipient address
  /// @param _amount amount to transfer
  function _transferAmount(address payable _recipient, uint256 _amount) private {
    if (tokenAddress == address(0)) {
      Address.sendValue(_recipient, _amount);
    } else {
      IERC20(tokenAddress).safeTransfer(_recipient, _amount);
    }
  }
}

