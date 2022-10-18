# IVotingStrategy





Defines the abstract contract for voting algorithms on grants within a round. Any new voting algorithm would be expected to extend this abstract contract. Every IVotingStrategy contract would be unique to RoundImplementation and would be deployed before creating a round



## Methods

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the voting contracts is to be used




### roundAddress

```solidity
function roundAddress() external view returns (address)
```

Round address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### vote

```solidity
function vote(bytes[] _encodedVotes, address _voterAddress) external payable
```

Invoked by RoundImplementation to allow voter to case vote for grants during a round.

*- allows contributor to do cast multiple votes which could be weighted. - should be invoked by RoundImplementation contract - ideally IVotingStrategy implementation should emit events after a vote is cast - this would be triggered when a voter casts their vote via grant explorer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedVotes | bytes[] | encoded votes |
| _voterAddress | address | voter address |




