# MerklePayoutStrategy





Merkle Payout Strategy contract which is deployed once per round and is used to upload the final match distribution.

*- TODO: add function distribute() to actually distribute the funds*

## Methods

### distributionMetaPtr

```solidity
function distributionMetaPtr() external view returns (uint256 protocol, string pointer)
```

Unix timestamp from when round stops accepting applications




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used




### merkleRoot

```solidity
function merkleRoot() external view returns (bytes32)
```

Unix timestamp from when round can accept applications




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

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
function updateDistribution(bytes encodedDistribution) external nonpayable
```

Invoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after   distribution is updated - would be invoked at the end of the roune*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedDistribution | bytes | encoded distribution |



## Events

### DistributionUpdated

```solidity
event DistributionUpdated(bytes32 merkleRoot, MetaPtr distributionMetaPtr)
```

Emitted when the distribution is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot  | bytes32 | undefined |
| distributionMetaPtr  | MetaPtr | undefined |



