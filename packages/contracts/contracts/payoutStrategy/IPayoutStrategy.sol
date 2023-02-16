// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

/// @title IPayoutStrategy
/// @notice Defines the abstract contract for payout strategies for a round. Any new payout strategy would be expected to extend this abstract contract. Every IPayoutStrategy contract would be unique to RoundImplementation and would be deployed before creating a round.
/// @dev Should be deployed before creating a round. Init will be invoked during round creation to link the payout strategy to the round contract
// TODO: add function distribute() to actually distribute the funds
abstract contract IPayoutStrategy {
    //
    // --- State variables ---
    //
    /// @notice Round address
    address public roundAddress;

    //
    // --- Modifiers ---
    //
    /// @notice modifier to check if sender is round contract.
    modifier isRoundContract() {
        require(
            roundAddress != address(0),
            "error: payout contract not linked to a round"
        );
        require(
            msg.sender == roundAddress,
            "error: can be invoked only by round contract"
        );
        _;
    }

    //
    // --- Functions ---
    //
    /// @notice Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used
    /// @dev Should only be invoked once by RoundImplementation
    function init() external {
        require(roundAddress == address(0), "init: roundAddress already set");
        roundAddress = msg.sender;
    }

    /// @notice Invoked by RoundImplementation to upload distribution to the payout strategy
    /// @dev Should be invoked by the RoundImplementation contract. Ideally IPayoutStrategy implementation should emit events after distribution is updated. Would be invoked at the end of the round.
    /// @param _encodedDistribution distribution encoded in bytes
    function updateDistribution(
        bytes calldata _encodedDistribution
    ) external virtual;
}
