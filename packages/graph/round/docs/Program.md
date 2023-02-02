## Program

The following documents lays out the kind of queries which can be made against the subgraph w.r.t Programs.
Test the queries over at https://thegraph.com/hosted-service/subgraph/thelostone-mc/program-factory-v0?selected=playground


**Fetch all programs created**

```graphql
{
	programs {
    id
  }
}
```

**Fetch all programs managed a given address**

```graphql
{
	programAccounts(where: {
    address: "0x5cdb35fadb8262a3f88863254c870c2e6a848cca"
  }) {
    program {
      id
    }
  }
}
```


**Fetch all programs managed a given address and the roles they have**
```graphql
{
	programAccounts(where: {
    address: "0x5cdb35fadb8262a3f88863254c870c2e6a848cca"
  }) {
    program {
      id
      roles {
        role
      }
    }
  }
}
```


**Fetch roles & accounts of all programs**
```graphql
{
  programs {
    id
    roles {
      role,
      accounts {
      	address
    	}
    }
  }
  
}
```


**Fetch accounts having a certain role on a certain program**
```graphql
{
  programs(where: {
   id: "0xA758560ED04c45FE77D1bE3aFC1f8B0eb4Cc597c"
  }) {
    id
    roles(where: {
      role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
    }) {
      role,
      accounts {
      	address
    	}
    }
  }
}
```