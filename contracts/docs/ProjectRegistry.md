# ProjectRegistry



> ProjectRegistry





## Methods

### addProjectOwner

```solidity
function addProjectOwner(uint96 projectID, address newOwner) external nonpayable
```

Associate a new owner with a project



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint96 | ID of previously created project |
| newOwner | address | address of new project owner |

### createProject

```solidity
function createProject(MetaPtr metadata) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| metadata | MetaPtr | undefined |

### getProjectOwners

```solidity
function getProjectOwners(uint96 projectID) external view returns (address[])
```

Retrieve list of project owners 



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint96 | ID of project  |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | List of current owners of given project |

### initialize

```solidity
function initialize() external nonpayable
```

Initializes the contract after an upgrade

*In future deploys of the implementation, an higher version should be passed to reinitializer*


### projectOwnersCount

```solidity
function projectOwnersCount(uint96 projectID) external view returns (uint256)
```

Retrieve count of existing project owners



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint96 | ID of project  |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Count of owners for given project |

### projects

```solidity
function projects(uint96) external view returns (uint96 id, struct MetaPtr metadata)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint96 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint96 | undefined |
| metadata | MetaPtr | undefined |

### projectsCount

```solidity
function projectsCount() external view returns (uint96)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint96 | undefined |

### projectsOwners

```solidity
function projectsOwners(uint96) external view returns (uint256 count)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint96 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| count | uint256 | undefined |

### removeProjectOwner

```solidity
function removeProjectOwner(uint96 projectID, address prevOwner, address owner) external nonpayable
```

Disassociate an existing owner from a project



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint96 | ID of previously created project |
| prevOwner | address | Address of previous owner in OwnerList |
| owner | address | Address of new Owner |

### updateProjectMetadata

```solidity
function updateProjectMetadata(uint96 projectID, MetaPtr metadata) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint96 | undefined |
| metadata | MetaPtr | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MetadataUpdated

```solidity
event MetadataUpdated(uint96 indexed projectID, MetaPtr metaPtr)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID `indexed` | uint96 | undefined |
| metaPtr  | MetaPtr | undefined |

### OwnerAdded

```solidity
event OwnerAdded(address owner, uint96 projectID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner  | address | undefined |
| projectID  | uint96 | undefined |

### OwnerRemoved

```solidity
event OwnerRemoved(address owner, uint96 projectID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner  | address | undefined |
| projectID  | uint96 | undefined |

### ProjectCreated

```solidity
event ProjectCreated(address indexed owner, uint96 projectID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| projectID  | uint96 | undefined |



