// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../utils/MetaPtr.sol";

import "./QuadraticFundingVotingStrategyImplementation.sol";

contract QuadraticFundingVotingStrategyFactory is OwnableUpgradeable {
 
  address public votingContract;

  // --- Event ---

  /// @notice Emitted when a Voting contract is updated
  event VotingContractUpdated(address votingContractAddress);

  /// @notice Emitted when a new Voting is created
  event VotingContractCreated(address indexed votingContractAddress, address indexed votingImplementation);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() external initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  // --- Core methods ---

  /**
   * @notice Allows the owner to update the QuadraticFundingVotingStrategyImplementation.
   * This provides us the flexibility to upgrade QuadraticFundingVotingStrategyImplementation
   * contract while relying on the same QuadraticFundingVotingStrategyFactory to get the list of
   * QuadraticFundingVoting contracts.
   */
  function updateVotingContract(address newVotingContract) external onlyOwner {
    // slither-disable-next-line missing-zero-check
    votingContract = newVotingContract;

    emit VotingContractUpdated(newVotingContract);
  }

  /**
   * @notice Clones QuadraticFundingVotingStrategyImplementation and deploys a contract
   * and emits an event
   */
  function create() external returns (address) {

    address clone = ClonesUpgradeable.clone(votingContract);
    emit VotingContractCreated(clone, votingContract);
    QuadraticFundingVotingStrategyImplementation(clone).initialize();

    return clone;
  }
}
