// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "../IPayoutStrategy.sol";

import "../../utils/MetaPtr.sol";

/**
 * @notice Merkle Payout Strategy contract which is deployed once per round
 * and is used to upload the final match distribution.
 *
 * @dev
 *  - TODO: add function distribute() to actually distribute the funds
 */
contract MerklePayoutStrategyImplementation is IPayoutStrategy, Initializable {
    // --- Data ---

    /// @notice merkle root generated from distribution
    bytes32 public merkleRoot;

    /// @notice map of booleans to keep track of claims
    mapping(address => bool) private distributed;

    // --- Event ---

    /// @notice Emitted when the distribution is updated
    event DistributionUpdated(bytes32 merkleRoot, MetaPtr distributionMetaPtr);

    /// @notice Emitted when funds are distributed
    event FundsDistributed(
        uint256 amount,
        address grantee,
        address indexed token,
        bytes32 indexed projectId
    );

    /// @notice Emitted when batch payout is successful
    event BatchPayoutSuccessful(address indexed sender);

    // --- Types ---
    struct Distribution {
        uint256 index;
        address grantee;
        uint256 amount;
        bytes32[] merkleProof;
        bytes32 projectId;
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
     * - would be invoked at the end of the roune
     *
     * @param encodedDistribution encoded distribution
     */
    function updateDistribution(
        bytes calldata encodedDistribution
    ) external override isRoundOperator {
        (bytes32 _merkleRoot, MetaPtr memory _distributionMetaPtr) = abi.decode(
            encodedDistribution,
            (bytes32, MetaPtr)
        );

        merkleRoot = _merkleRoot;
        distributionMetaPtr = _distributionMetaPtr;

        emit DistributionUpdated(merkleRoot, distributionMetaPtr);
    }

      /// @notice function to check if distribution is set
  function isDistributionSet() public view override returns (bool) {
    return merkleRoot != "";
  }

    /// @notice function to distribute funds to recipient
    /// @dev can be invoked only by round operator
    /// @param _distributions encoded distribution
    function payout(
        Distribution[] calldata _distributions
    ) external payable virtual isRoundOperator {
        require(isReadyForPayout == true, "Payout: Not ready for payout");

        for (uint256 i = 0; i < _distributions.length; ++i) {
            _distribute(_distributions[i]);
        }

        emit BatchPayoutSuccessful(msg.sender);
    }

    /// @notice Util function to distribute funds to recipient
    /// @param _distribution encoded distribution
    function _distribute(Distribution calldata _distribution) private {
        address _grantee = _distribution.grantee;
        uint256 _amount = _distribution.amount;
        bytes32 _projectId = _distribution.projectId;
        bytes32[] memory _merkleProof = _distribution.merkleProof;

        require(!distributed[_grantee], "Payout: Already distributed");

        /* We need double hashing to prevent second preimage attacks */
        bytes32 node = keccak256(
            bytes.concat(keccak256(abi.encode(_grantee, _amount, _projectId)))
        );

        require(
            MerkleProof.verify(_merkleProof, merkleRoot, node),
            "Payout: Invalid proof"
        );

        distributed[_grantee] = true;

        _transferAmount(payable(_grantee), _amount);

        emit FundsDistributed(_amount, _grantee, tokenAddress, _projectId);
    }

    /// @notice Util function to transfer amount to recipient
    /// @param _recipient recipient address
    /// @param _amount amount to transfer
    function _transferAmount(
        address payable _recipient,
        uint256 _amount
    ) private {
        if (tokenAddress == address(0)) {
            Address.sendValue(_recipient, _amount);
        } else {
            IERC20(tokenAddress).safeTransfer(_recipient, _amount);
        }
    }
}
