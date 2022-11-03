// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../utils/MetaPtr.sol";

import "./ProgramImplementation.sol";

contract ProgramFactory is OwnableUpgradeable {
 
  address public programContract;

  // --- Event ---

  /// @notice Emitted when a Program contract is updated
  event ProgramContractUpdated(address programContractAddress);

  /// @notice Emitted when a new Program is created
  event ProgramCreated(address indexed programContractAddress, address indexed programImplementation);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() external initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  // --- Core methods ---

  /**
   * @notice Allows the owner to update the ProgramImplementation.
   * This provides us the flexibility to upgrade ProgramImplementation
   * contract while relying on the same ProgramFactory to get the list of
   * programs.
   */
  function updateProgramContract(address newProgramContract) external onlyOwner {
    // slither-disable-next-line missing-zero-check
    programContract = newProgramContract;

    emit ProgramContractUpdated(newProgramContract);
  }

  /**
   * @notice Clones ProgramImplmentation and deployed a program and emits an event
   *
   * @param encodedParameters Encoded parameters for creating a program
   */
  function create(
    bytes calldata encodedParameters
  ) external returns (address) {

    address clone = ClonesUpgradeable.clone(programContract);
    emit ProgramCreated(clone, programContract);
    ProgramImplementation(clone).initialize(encodedParameters);

    return clone;
  }
}
