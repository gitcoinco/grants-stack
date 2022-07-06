## Rounds

The following documents lays out the kind of queries which can be made against the subgraph w.r.t Rounds.
Test the queries over at https://thegraph.com/hosted-service/subgraph/thelostone-mc/program-factory-v0?selected=playground

**Fetch all rounds created**

```graphql
{
  rounds {
    id
  }
}
```

**Fetch accounts (with their roles) & program of all rounds**

```graphql
{
  rounds {
    id
    program
    accounts {
      address
      role {
        role
      }
    }
  }
}
```

**Fetch all rounds created by a program**

```graphql
{
  rounds(where: {
    program: "0xA758560ED04c45FE77D1bE3aFC1f8B0eb4Cc597c"
  }) {
    id
  }
}
```


**Fetch all rounds managed by a specific account with thier role**

```graphql
{
    roundAccounts(where: {
      address: "0x5cdb35fadb8262a3f88863254c870c2e6a848cca"
    }) {
      address
    	role {
        role
      }
      round {
        id
      }
    }
}
```

**Fetch all rounds managed by a specific account with a specific role**

```graphql
{
  roundRoles (
    where: {
      role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
    }
  ) {
    accounts(where: {
      address: "0x5cdb35fadb8262a3f88863254c870c2e6a848cca"
    }) {
      address
      round{
        id
      }
    }
  }
}
```

**Fetch accounts having a specific role on a specific round**

```graphql

{
  rounds(where: {
    id: "0x592b8983f02cF41bBAa3Bb39920E5498Bd9cD938"
  }) {
  	roles(where: {
      role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
    }) {
      accounts {
        address
      }
    }
  }
}
```


**Fetch all accounts & their roles in a specific round**
```graphql
{
  rounds(where :{
    id: "0x30683Ae980f3049E0fECF376945eC6f279e3E351"
  }) {
    accounts {
      address
      role {
        role
      }
    }
  }
}
```

**Fetch all rounds by a project id and know it's status**

You can do this by two means :
##### Filtering against the round

```graphql
{
  rounds(where:{
    id: "0x30683Ae980f3049E0fECF376945eC6f279e3E351"
  }) {
    id
    projects {
      id
      status
      metaPtr {
        protocol
        pointer
      }
    }
  }
}
```

##### Filtering against the roundProject


```graphql
{
  roundProjects(where: {
    round: "0x30683Ae980f3049E0fECF376945eC6f279e3E351"
  }) {
    id
    status
    metaPtr{
      protocol
      pointer
    }
    round {
      id
    }
  }
}
```