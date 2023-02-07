# MerklePayoutStrategy





Merkle Payout Strategy contract which is deployed once per round and is used to upload the final match distribution.



## Methods

### LOCK_DURATION

```solidity
function LOCK_DURATION() external view returns (uint256)
```

Locking duration




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### ROUND_OPERATOR_ROLE

```solidity
function ROUND_OPERATOR_ROLE() external view returns (bytes32)
```

round operator role




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### VERSION

```solidity
function VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### distributionMetaPtr

```solidity
function distributionMetaPtr() external view returns (uint256 protocol, string pointer)
```

MetaPtr containing the distribution




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### endLockingTime

```solidity
function endLockingTime() external view returns (uint256)
```

End locking time




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### payout

```solidity
function payout(bytes[] encodedDistribution) external payable
```

Invoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after   payout is complete - would be invoked at the end of the round*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedDistribution | bytes[] | encoded distribution |

### roundAddress

```solidity
function roundAddress() external view returns (address)
```

RoundImplementation address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### tokenAddress

```solidity
function tokenAddress() external view returns (address)
```

Token address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### updateDistribution

```solidity
function updateDistribution(bytes encodedDistribution) external nonpayable
```

Invoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after   distribution is updated - would be invoked at the end of the round*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedDistribution | bytes | encoded distribution |

### withdrawFunds

```solidity
function withdrawFunds(address payable withdrawFundsAddress) external nonpayable
```

Invoked by RoundImplementation to withdraw funds to withdrawFundsAddress from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| withdrawFundsAddress | address payable | withdraw funds address |



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

### FundsWithdrawn

```solidity
event FundsWithdrawn(address indexed tokenAddress, uint256 amount)
```

Emitted when funds are withdrawn from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress `indexed` | address | undefined |
| amount  | uint256 | undefined |



