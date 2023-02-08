// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../utils/MetaPtr.sol";

import "./ProgramImplementation.sol";

/// @title ProgramFactory
/// @notice Used to create a new instance of the ProgramImplementation contract
contract ProgramFactory is OwnableUpgradeable {
    //
    // --- State variables ---
    //
    /// @notice Stores a reference to the ProgramImplementation contract
    /// @dev This is the current implementation of the contract that will be cloned to create a new program. This can be updated.
    address public programContract;

    //
    // --- Events ---
    //
    /// @notice Emitted when a Program contract is updated
    event ProgramContractUpdated(address programContractAddress);

    /// @notice Emitted when a new Program is created
    event ProgramCreated(
      address indexed programContractAddress,
      address indexed programImplementation
    );

    //
    // --- Functions ---
    //
    /// @notice constructor function which ensure deployer is set as owner
    function initialize() external initializer {
      __Context_init_unchained();
      __Ownable_init_unchained();
    }

    /// @notice Allows the owner to update the ProgramImplementation. This provides us the flexibility to upgrade ProgramImplementation contract while relying on the same ProgramFactory to get the list of programs.
    /// @dev This function is used to update the programContract address
    /// @param newProgramContract Address of the new ProgramImplementation contract
    function updateProgramContract(address newProgramContract) external onlyOwner {
      // slither-disable-next-line missing-zero-check
      programContract = newProgramContract;

      emit ProgramContractUpdated(newProgramContract);
    }

    /// @notice Clones ProgramImplmentation and deploys a program
    /// @dev This function is used to create a new program, an instance of the ProgramImplementation contract
    /// @param encodedParameters Encoded parameters for creating a program
    /// @return address of the newly created program
    function create(
      bytes calldata encodedParameters
    ) external returns (address) {

      address clone = ClonesUpgradeable.clone(programContract);
      emit ProgramCreated(clone, programContract);
      ProgramImplementation(clone).initialize(encodedParameters);

      return clone;
    }
}
