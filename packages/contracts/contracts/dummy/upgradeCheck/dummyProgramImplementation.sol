// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../../utils/MetaPtr.sol";


/// THIS IS A DUMMY CONTRACT. DO NOT USE THIS
contract DummyProgramImplementation is AccessControl, Initializable {

  using Address for address;

  bytes32 public constant PROGRAM_OPERATOR_ROLE = keccak256("PROGRAM_OPERATOR");

  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  MetaPtr public metaPtr;
  string public message;

  function initialize(
    MetaPtr memory _metaPtr,
    address _adminRole,
    address[] memory _programOperators, 
    string calldata _message
  ) public initializer {
  
    metaPtr = _metaPtr;
    message = _message;

    _grantRole(DEFAULT_ADMIN_ROLE, _adminRole);

    for (uint256 i = 0; i < _programOperators.length; ++i) {
      _grantRole(PROGRAM_OPERATOR_ROLE, _programOperators[i]);
    }
  }

  function updateMetaPtr(MetaPtr memory _newMetaPtr) public onlyRole(PROGRAM_OPERATOR_ROLE) {
    emit MetadataUpdated(metaPtr, _newMetaPtr);
    metaPtr = _newMetaPtr;
  }
}