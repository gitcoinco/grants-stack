# IPayoutStrategy





Defines the abstract contract for payout strategies for a round. Any new payout strategy would be expected to extend this abstract contract. Every IPayoutStrategy contract would be unique to RoundImplementation and would be deployed before creating a round 

*- Deployed before creating a round  - init will be invoked during round creation to link the payout    strategy to the round contract   - TODO: add function distribute() to actually distribute the funds  *

## Methods

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used




### roundAddress

```solidity
function roundAddress() external view returns (address)
```

Round address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### updateDistribution

```solidity
function updateDistribution(bytes _encodedDistribution) external nonpayable
```

Invoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after    distribution is updated - would be invoked at the end of the roune*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedDistribution | bytes | encoded distribution |




