# IPayoutStrategy





Defines the abstract contract for payout strategies for a round. Any new payout strategy would be expected to extend this abstract contract. Every IPayoutStrategy contract would be unique to RoundImplementation and would be deployed before creating a round 

*- Deployed before creating a round  - init will be invoked during round creation to link the payout    strategy to the round contract   - TODO: add function distribute() to actually distribute the funds  *

## Methods

### ROUND_OPERATOR_ROLE

```solidity
function ROUND_OPERATOR_ROLE() external view returns (bytes32)
```

round operator role




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

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

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used




### isDistributionSet

```solidity
function isDistributionSet() external view returns (bool)
```

checks that distribution is set before setReadyForPayout




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isReadyForPayout

```solidity
function isReadyForPayout() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### roundAddress

```solidity
function roundAddress() external view returns (address payable)
```

Round address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### setReadyForPayout

```solidity
function setReadyForPayout() external payable
```

Invoked by RoundImplementation to set isReadyForPayout




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
function updateDistribution(bytes _encodedDistribution) external nonpayable
```

Invoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after    distribution is updated - would be invoked at the end of the round*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedDistribution | bytes | encoded distribution |

### withdrawFunds

```solidity
function withdrawFunds(address payable withdrawAddress) external payable
```

Invoked by RoundImplementation to withdraw funds to withdrawAddress from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| withdrawAddress | address payable | withdraw funds address |



## Events

### FundsWithdrawn

```solidity
event FundsWithdrawn(address indexed tokenAddress, uint256 amount, address withdrawAddress)
```

Emitted when funds are withdrawn from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress `indexed` | address | undefined |
| amount  | uint256 | undefined |
| withdrawAddress  | address | undefined |

### ReadyForPayout

```solidity
event ReadyForPayout()
```

Emitted when contract is ready for payout






