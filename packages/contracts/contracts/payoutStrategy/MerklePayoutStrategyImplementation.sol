// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./IPayoutStrategy.sol";

// TODO: Documentation
contract MerklePayoutStrategyImplementation is IPayoutStrategy, AccessControlEnumerable, Initializable {

    using Address for address;
    using SafeERC20 for IERC20;

    string public constant VERSION = "0.2.0";
    bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

    bytes32 public merkleRoot;
    IERC20 public token;

    mapping(uint256 => uint256) private claimedBitMap;

    event ReclaimFunds(address indexed sender, IERC20 indexed token, uint256 indexed amount);
    event FundsClaimed(uint256 index, address indexed claimee, uint256 indexed amount);
    event BatchClaimTriggered(address indexed sender);
    event DistributionUpdated(bytes32 merkleRoot);

    struct Claim {
        uint256 index;
        address claimee;
        uint256 amount;
        bytes32[] merkleProof;
    }

    function initialize(
        bytes calldata encodedParameters
    ) external initializer isRoundContract {
        (
        IERC20 _token,
        address[] memory _roundOperators,
        address[] memory _adminRoles
        ) = abi.decode(
            encodedParameters,
            (IERC20, address[], address[])
        );

        token = _token;

        // Assigning default admin role
        for (uint256 i = 0; i < _adminRoles.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
        }

        // Assigning round operators
        for (uint256 i = 0; i < _roundOperators.length; ++i) {
            _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
        }
    }

    function _setClaimed(uint256 _index) private {
        uint256 claimedWordIndex = _index / 256;
        uint256 claimedBitIndex = _index % 256;
        claimedBitMap[claimedWordIndex] |= (1 << claimedBitIndex);
    }

    function updateDistribution(bytes calldata encodedDistribution) external override onlyRole(ROUND_OPERATOR_ROLE) {

        (bytes32 _merkleRoot) = abi.decode(
            encodedDistribution,
            (bytes32)
        );

        merkleRoot = _merkleRoot;

        emit DistributionUpdated(merkleRoot);
    }

    function hasClaimed(uint256 _index) public view returns (bool) {
        uint256 claimedWordIndex = _index / 256;
        uint256 claimedBitIndex = _index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];

        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function claim(Claim calldata _claim) public {
        uint256 _index = _claim.index;
        address _claimee = _claim.claimee;
        uint256 _amount = _claim.amount;
        bytes32[] calldata _merkleProof = _claim.merkleProof;

        require(!hasClaimed(_index), "MerklePayout: Funds already claimed.");

        bytes32 node = keccak256(abi.encodePacked(_index, _claimee, _amount));
        require(MerkleProof.verify(_merkleProof, merkleRoot, node), "MerklePayout: Invalid proof.");

        _setClaimed(_index);
        token.safeTransfer(_claimee, _amount);

        emit FundsClaimed(_index, _claimee, _amount);
    }

    function reclaimFunds(IERC20 _token) external onlyRole(ROUND_OPERATOR_ROLE) {

        uint256 _balance = _token.balanceOf(address(this));

        // CHECK: Should this be the sender?
        token.safeTransfer(msg.sender, _balance);

        emit ReclaimFunds(msg.sender, _token, _balance);
    }

    function batchClaim(Claim[] calldata _claims) external onlyRole(ROUND_OPERATOR_ROLE) {

        for (uint256 i = 0; i < _claims.length; ++i) {
            claim(_claims[i]);
        }

        emit BatchClaimTriggered(msg.sender);
    }
}
