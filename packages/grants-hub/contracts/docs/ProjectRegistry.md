# ProjectRegistry



> ProjectRegistry





## Methods

### addProjectOwner

```solidity
function addProjectOwner(uint256 projectID, address newOwner) external nonpayable
```

Associate a new owner with a project



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint256 | ID of previously created project |
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
function getProjectOwners(uint256 projectID) external view returns (address[])
```

Retrieve list of project owners 



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint256 | ID of project  |

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
function projectOwnersCount(uint256 projectID) external view returns (uint256)
```

Retrieve count of existing project owners



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint256 | ID of project  |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Count of owners for given project |

### projects

```solidity
function projects(uint256) external view returns (uint256 id, struct MetaPtr metadata)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |
| metadata | MetaPtr | undefined |

### projectsCount

```solidity
function projectsCount() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### projectsOwners

```solidity
function projectsOwners(uint256) external view returns (uint256 count)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| count | uint256 | undefined |

### removeProjectOwner

```solidity
function removeProjectOwner(uint256 projectID, address prevOwner, address owner) external nonpayable
```

Disassociate an existing owner from a project



#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint256 | ID of previously created project |
| prevOwner | address | Address of previous owner in OwnerList |
| owner | address | Address of new Owner |

### updateProjectMetadata

```solidity
function updateProjectMetadata(uint256 projectID, MetaPtr metadata) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | uint256 | undefined |
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
event MetadataUpdated(uint256 indexed projectID, MetaPtr metaPtr)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID `indexed` | uint256 | undefined |
| metaPtr  | MetaPtr | undefined |

### OwnerAdded

```solidity
event OwnerAdded(uint256 indexed projectID, address indexed owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |

### OwnerRemoved

```solidity
event OwnerRemoved(uint256 indexed projectID, address indexed owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |

### ProjectCreated

```solidity
event ProjectCreated(uint256 indexed projectID, address indexed owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |



