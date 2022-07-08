// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

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
  event ProgramCreated(address indexed programContractAddress);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() public initializer {
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
  function updateProgramContract(address _programContract) public onlyOwner {
    programContract = _programContract;

    emit ProgramContractUpdated(_programContract);
  }

  /**
   * @notice Clones ProgramImplmentation and deployed a program and emits an event
   *
   * @param _encodedParameters Encoded parameters for creating a program
   */
  function create(
    bytes calldata _encodedParameters
  ) external returns (address) {

    address clone = ClonesUpgradeable.clone(programContract);

    ProgramImplementation(clone).initialize(_encodedParameters);

    emit ProgramCreated(clone);

    return clone;
  }
}