# MerklePayoutStrategyFactory









## Methods

### create

```solidity
function create() external nonpayable returns (address)
```

Clones MerklePayoutStrategyImplementation and deploys a contract and emits an event




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### initialize

```solidity
function initialize() external nonpayable
```

constructor function which ensure deployer is set as owner




### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### payoutImplementation

```solidity
function payoutImplementation() external view returns (address payable)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### updatePayoutImplementation

```solidity
function updatePayoutImplementation(address payable newPayoutImplementation) external nonpayable
```

Allows the owner to update the payoutImplementation. This provides us the flexibility to upgrade MerklePayoutStrategyImplementation contract while relying on the same MerklePayoutStrategyFactory to get the list of MerklePayout contracts.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newPayoutImplementation | address payable | - address of the new payoutImplementation |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### PayoutContractCreated

```solidity
event PayoutContractCreated(address indexed payoutContractAddress, address indexed payoutImplementation)
```

Emitted when a new payout contract is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| payoutContractAddress `indexed` | address | undefined |
| payoutImplementation `indexed` | address | undefined |

### PayoutImplementationUpdated

```solidity
event PayoutImplementationUpdated(address merklePayoutStrategyAddress)
```

Emitted when payoutImplementation is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| merklePayoutStrategyAddress  | address | undefined |



