# IVotingStrategy





Defines the interface for voting algorithms on grants within a round. Any new voting algorithm would be expected to implement this interface. Every IVotingStrategy implementation would ideally be deployed once per chain and be invoked by the RoundImplementation contract



## Methods

### vote

```solidity
function vote(bytes[] _encodedVotes, address _voterAddress) external nonpayable
```

Invoked by RoundImplementation to allow voter to case vote for grants during a round.

*- allows contributor to do cast multiple votes which could be weighted. - should be invoked by RoundImplementation contract - ideally IVotingStrategy implementation should emit events after a vote is cast - this would be triggered when a voter casts their vote via round explorer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedVotes | bytes[] | encoded votes |
| _voterAddress | address | voter address |




