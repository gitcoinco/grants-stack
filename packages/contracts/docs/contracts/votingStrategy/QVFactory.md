# QVFactory









## Methods

### create

```solidity
function create(bytes encodedParameters, address ownedBy) external nonpayable returns (address)
```

Clones QVImp into a new quadratic voting contract and emits event



#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedParameters | bytes | Encoded parameters for creating a qv contract |
| ownedBy | address | Program which created the contract |

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

### qvContract

```solidity
function qvContract() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### updateQVContract

```solidity
function updateQVContract(address newQVContract) external nonpayable
```

Allows the owner to update the QVImplementation. This provides us the flexibility to upgrade QVImplementation contract while relying on the same QVFactory



#### Parameters

| Name | Type | Description |
|---|---|---|
| newQVContract | address | undefined |



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

### QVContractUpdated

```solidity
event QVContractUpdated(address qvAddress)
```

Emitted when a QV contract is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| qvAddress  | address | undefined |

### QVCreated

```solidity
event QVCreated(address indexed qvAddress, address indexed ownedBy)
```

Emitted when a new QV contract is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| qvAddress `indexed` | address | undefined |
| ownedBy `indexed` | address | undefined |



