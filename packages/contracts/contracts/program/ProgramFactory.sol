// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../utils/MetaPtr.sol";

import "./ProgramImplementation.sol";

contract ProgramFactory is Ownable {
 
  address public programContract;

  // --- Event ---

  /// @notice Emitted when a Program contract is updated
  event ProgramContractUpdated(address programContractAddress);

  /// @notice Emitted when a new Program is created
  event ProgramCreated(address indexed programContractAddress);


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
   * @param _metaPtr URL pointing to the program metadata
   * @param _programOperators Addresses to be granted PROGRAM_OPERATOR_ROLE
   */
  function create(
    MetaPtr calldata _metaPtr,
    address[] calldata _programOperators
  ) external returns (address) {

    address clone = Clones.clone(programContract);

    ProgramImplementation(clone).initialize(
      _metaPtr,
      _programOperators
    );

    emit ProgramCreated(clone);

    return clone;
  }
}