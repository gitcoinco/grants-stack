# QuadraticFundingVotingStrategyFactory









## Methods

### create

```solidity
function create() external nonpayable returns (address)
```

Clones QuadraticFundingVotingStrategyImplementation and deploys a contract and emits an event




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

### updateVotingContract

```solidity
function updateVotingContract(address newVotingContract) external nonpayable
```

Allows the owner to update the QuadraticFundingVotingStrategyImplementation. This provides us the flexibility to upgrade QuadraticFundingVotingStrategyImplementation contract while relying on the same QuadraticFundingVotingStrategyFactory to get the list of QuadraticFundingVoting contracts.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newVotingContract | address | undefined |

### votingContract

```solidity
function votingContract() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



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

### VotingContractCreated

```solidity
event VotingContractCreated(address indexed votingContractAddress, address indexed votingImplementation)
```

Emitted when a new Voting is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| votingContractAddress `indexed` | address | undefined |
| votingImplementation `indexed` | address | undefined |

### VotingContractUpdated

```solidity
event VotingContractUpdated(address votingContractAddress)
```

Emitted when a Voting contract is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| votingContractAddress  | address | undefined |



