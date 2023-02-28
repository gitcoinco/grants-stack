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

  /// @notice Emitted when funds are distributed
  event FundsDistributed(uint256 index, uint256 amount, address indexed token, address indexed sender, address indexed grantee);

  /// @notice Emitted when batch payout is successful
  event BatchPayoutSuccessful(address indexed sender);

  // --- Types ---
  struct Distribution {
    uint256 index;
    address grantee;
    uint256 amount;
    bytes32[] merkleProof;
  }

  function initialize() external initializer {
    // empty initializer
  }

  // --- Core methods ---

  /// @notice Invoked by round operator to update the merkle root and distribution MetaPtr
  /// @param encodedDistribution encoded distribution
  function updateDistribution(bytes calldata encodedDistribution) external override roundHasEnded isRoundOperator {

    require(isReadyForPayout == false, "Payout: Already ready for payout");

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
  function hasBeenDistributed(uint256 _index) public view returns (bool) {

    uint256 distributedWordIndex = _index / 256;
    uint256 distributedBitIndex = _index % 256;
    uint256 distributedWord = distributedBitMap[distributedWordIndex];
    uint256 mask = (1 << distributedBitIndex);

    return distributedWord & mask == mask;
  }

  /// @notice payout function defined in IPayoutStrategy
  /// @dev NOT IMPLEMENTED. Use payout(Distribution[] calldata _distributions) instead
  /// @param _distributions encoded distribution
  function payout(bytes[] calldata _distributions) external virtual override payable isRoundOperator {
    /// Not implemented from IPayoutStrategy due as encoding of struct with dynamic array is
    // different in solidity 0.8.17 (more padding while encoding) and ethers
  }

  /// @notice function to distribute funds to recipient
  /// @dev can be invoked only by round operator
  /// @param _distributions encoded distribution
  function payout(Distribution[] calldata _distributions) external virtual payable isRoundOperator {
    require(isReadyForPayout == true, "Payout: Not ready for payout");

    for (uint256 i = 0; i < _distributions.length; ++i) {
      _distribute(_distributions[i]);
    }

    emit BatchPayoutSuccessful(msg.sender);
  }

  /// @notice Util function to distribute funds to recipient
  /// @param _distribution encoded distribution
  function _distribute(Distribution calldata _distribution) private {
    uint256 _index = _distribution.index;
    address _grantee = _distribution.grantee;
    uint256 _amount = _distribution.amount;
    bytes32[] memory _merkleProof = _distribution.merkleProof;

    require(!hasBeenDistributed(_index), "Payout: Already distributed");

    /* We need double hashing to prevent second preimage attacks */
    bytes32 node = keccak256(bytes.concat(keccak256(abi.encode(_index, _grantee, _amount))));

    require(MerkleProof.verify(_merkleProof, merkleRoot, node), "Payout: Invalid proof");

    _setDistributed(_index);

    _transferAmount(payable(_grantee), _amount);

    emit FundsDistributed(_index, _amount, tokenAddress, msg.sender, _grantee);
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
