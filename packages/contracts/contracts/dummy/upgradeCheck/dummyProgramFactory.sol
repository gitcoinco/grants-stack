// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../utils/MetaPtr.sol";

import "./dummyProgramImplementation.sol";

contract DummyProgramFactory is OwnableUpgradeable {
 
  address public programContract;

  string public foobar;

  event ProgramContractUpdated(address programContractAddress);

  /// @notice Emitted when a new Program is created
  event ProgramCreated(address indexed programContractAddress);


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
    bytes calldata encodedParameters,
    string calldata newFoobar
  ) external returns (address) {

    foobar = newFoobar;

    address clone = ClonesUpgradeable.clone(programContract);

    emit ProgramCreated(clone);

    DummyProgramImplementation(clone).initialize(encodedParameters, newFoobar);

    return clone;
  }
}
