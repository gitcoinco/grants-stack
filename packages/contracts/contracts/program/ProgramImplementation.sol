// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../utils/MetaPtr.sol";

/// @title ProgramImplementation
/// @notice Program which would managed by a group of PROGRAM_OPERATOR deployed via the ProgramFactory
contract ProgramImplementation is AccessControlEnumerable, Initializable {
    //
    // --- Types ---
    //
    using Address for address;

    //
    // --- State variables ---
    //
    /// @notice URL pointing for program metadata (for off-chain use)
    MetaPtr public metaPtr;

    /// @notice program operator role
    bytes32 public constant PROGRAM_OPERATOR_ROLE = keccak256("PROGRAM_OPERATOR");

    //
    // --- Errors ---
    //
    /// @notice Emitted when a team metadata pointer is updated
    event MetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

    //
    // --- Functions ---
    //
    /// @notice Instantiates a new program
    /// @dev The encoded parameters should be the following:
    ///  - _metaPtr URL pointing to the program metadata
    ///  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
    ///  - _programOperators Addresses to be granted PROGRAM_OPERATOR_ROLE
    /// @param encodedParameters Encoded parameters for program creation
    function initialize(
      bytes calldata encodedParameters
    ) external initializer {
    
      // Decode _encodedParameters
      (
        MetaPtr memory _metaPtr,
        address[] memory _adminRoles,
        address[] memory _programOperators
      ) = abi.decode(
        encodedParameters, (
        MetaPtr,
        address[],
        address[]
      ));

      // Emit MetaPtrUpdated event for indexing
      emit MetaPtrUpdated(metaPtr, _metaPtr);
      metaPtr = _metaPtr;

      // Assigning default admin role
      for (uint256 i = 0; i < _adminRoles.length; ++i) {
        _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
      }

      // Assigning program operators
      for (uint256 i = 0; i < _programOperators.length; ++i) {
        _grantRole(PROGRAM_OPERATOR_ROLE, _programOperators[i]);
      }
    }

    /// @notice Update metaPtr (only by PROGRAM_OPERATOR_ROLE)
    /// @param newMetaPtr new metaPtr
    function updateMetaPtr(MetaPtr memory newMetaPtr) external onlyRole(PROGRAM_OPERATOR_ROLE) {
      emit MetaPtrUpdated(metaPtr, newMetaPtr);
      metaPtr = newMetaPtr;
    }
}
