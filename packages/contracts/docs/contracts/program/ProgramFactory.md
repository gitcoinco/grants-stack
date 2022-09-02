# ProgramFactory









## Methods

### create

```solidity
function create(bytes encodedParameters) external nonpayable returns (address)
```

Clones ProgramImplmentation and deployed a program and emits an event



#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedParameters | bytes | Encoded parameters for creating a program |

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

### programContract

```solidity
function programContract() external view returns (address)
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

### updateProgramContract

```solidity
function updateProgramContract(address newProgramContract) external nonpayable
```

Allows the owner to update the ProgramImplementation. This provides us the flexibility to upgrade ProgramImplementation contract while relying on the same ProgramFactory to get the list of programs.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newProgramContract | address | undefined |



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

### ProgramContractUpdated

```solidity
event ProgramContractUpdated(address programContractAddress)
```

Emitted when a Program contract is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| programContractAddress  | address | undefined |

### ProgramCreated

```solidity
event ProgramCreated(address indexed programContractAddress, address indexed programImplementation)
```

Emitted when a new Program is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| programContractAddress `indexed` | address | undefined |
| programImplementation `indexed` | address | undefined |



