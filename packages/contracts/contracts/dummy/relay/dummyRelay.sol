// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/utils/Address.sol";

interface IRoundImplementation {
    /// @notice Invoked by voter to cast votes
    /// @param encodedVotes encoded vote
    /// @dev value is to handle native token voting
    function vote(bytes[] memory encodedVotes) external payable;
}

contract DummyRelay {
    // --- Libraries ---
    using Address for address;

    // --- State ---

    address grantRound;

    // --- Events ---
    event GrantsRoundUpdated(address newAddress);

    constructor(address grantRoundAddress) {
        grantRound = grantRoundAddress;
    }

    function vote(
        address[] calldata token,
        uint256[] calldata amount,
        address[] calldata grantAddress,
        bytes32[] calldata projectIds
    ) public {
        uint256 len = projectIds.length;

        bytes[] memory encodedVotes = new bytes[](len);

        for (uint256 i = 0; i < len; i++) {
            encodedVotes[i] = encodeVote(
                token[i],
                amount[i],
                grantAddress[i],
                projectIds[i]
            );
        }
        IRoundImplementation(grantRound).vote(encodedVotes);
    }

    function encodeVote(
        address _token,
        uint256 _amount,
        address _grantAddress,
        bytes32 _projectId
    ) internal view returns (bytes memory encodedVote) {
        encodedVote = abi.encode(
            msg.sender,
            _token,
            _amount,
            _grantAddress,
            _projectId
        );
    }
}
