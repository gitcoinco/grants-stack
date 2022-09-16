// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./QVImplementation.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract QVFactory is OwnableUpgradeable {
    
  address public qvContract;

  // --- Event ---

  /// @notice Emitted when a QV contract is updated
  event QVContractUpdated(address qvAddress);

  /// @notice Emitted when a new QV contract is created
  event QVCreated(address indexed qvAddress, address indexed ownedBy);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() external initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  // --- Core methods ---

  /**
  * @notice Allows the owner to update the QVImplementation.
  * This provides us the flexibility to upgrade QVImplementation
  * contract while relying on the same QVFactory
  */
  function updateQVContract(address newQVContract) external onlyOwner {
    // slither-disable-next-line missing-zero-check
    qvContract = newQVContract;

    emit QVContractUpdated(newQVContract);
  }

  /**
  * @notice Clones QVImp into a new quadratic voting contract and emits event
  *
  * @param encodedParameters Encoded parameters for creating a qv contract
  * @param ownedBy Program which created the contract
  */
  function create(
    bytes calldata encodedParameters,
    address ownedBy
  ) external returns (address) {

    address clone = ClonesUpgradeable.clone(qvContract);

    emit QVCreated(clone, ownedBy);

    QVImplementation(clone).initialize(
      encodedParameters
    );

    return clone;
  }
}