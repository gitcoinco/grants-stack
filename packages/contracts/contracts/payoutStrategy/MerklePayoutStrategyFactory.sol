// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "./MerklePayoutStrategyImplementation.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../utils/MetaPtr.sol";

// TODO: Documentation
contract MerklePayoutStrategyFactory is OwnableUpgradeable {

    address public merklePayoutContract;

    event MerklePayoutStrategyCreated(address indexed merklePayoutStrategyAddress, address indexed ownedBy, address indexed merklePayoutStrategyImplementation);

    event MerklePayoutStrategyUpdated(address merklePayoutStrategyAddress);

    function initialize() external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function updateMerklePayoutStrategyContract(address newMerklePayoutContract) external onlyOwner {
        // slither-disable-next-line missing-zero-check
        merklePayoutContract = newMerklePayoutContract;

        emit MerklePayoutStrategyUpdated(newMerklePayoutContract);

    }

    function create(
        bytes calldata encodedParameters,
        address ownedBy
    ) external returns (address) {

        address clone = ClonesUpgradeable.clone(merklePayoutContract);

        MerklePayoutStrategyImplementation(clone).initialize(
            encodedParameters
        );

        emit MerklePayoutStrategyCreated(clone, ownedBy, merklePayoutContract);

        return clone;
    }

}
