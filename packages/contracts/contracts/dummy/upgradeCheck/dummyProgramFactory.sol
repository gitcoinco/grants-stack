// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../utils/MetaPtr.sol";

import "./dummyProgramImplementation.sol";

contract DummyProgramFactory is OwnableUpgradeable {

  // @notice THIS IS A DUMMY CONTRACT. DO NOT USE THIS
 
  address public programContract;

  event ProgramContractUpdated(address programContractAddress);
  event ProgramCreated(address programContractAddress, string message);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() public initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  function updateProgramContract(address _programContract) public onlyOwner {
    programContract = _programContract;

    emit ProgramContractUpdated(_programContract);
  }

  function create(
    MetaPtr calldata _metaPtr,
    address[] calldata _programOperators,
    string calldata _message
  ) external returns (address) {

    address clone = ClonesUpgradeable.clone(programContract);

    DummyProgramImplementation(clone).initialize(
      _metaPtr,
      msg.sender,
      _programOperators,
      _message
    );

    emit ProgramCreated(clone, _message);

    return clone;
  }
}