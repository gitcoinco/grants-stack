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
    id: "0x515594eeB37A6D5815F4c860454cD4FD87539978"
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
    id: "0x707F12906E028dE672424d600c9C69460dcD2295"
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

**Fetch all projects by a round and know it's application status**

You can do this by two means :
##### Given a round id -> fetch all its projects

```graphql
{
  rounds(where:{
    id: "0xd96222ec011cded90be74969d0cffdf4247fae1b"
  }) {
    id
    projects {
      id
      project
      status
      payoutAddress
      metaPtr {
        protocol
        pointer
      }
    }
  }
}
```

##### Fetch all applications belonging to a given round


```graphql
{
  roundProjects(where: {
    round: "0x707F12906E028dE672424d600c9C69460dcD2295"
  }) {
    id
    status
    payoutAddress
    metaPtr {
      protocol
      pointer
    }
    round {
      id
    }
  }
}
```

### Project queries

**Fetch all applications submitted by a given project**

```graphql
{
  roundProjects(where: {
    project:"0x0247568f32b9ce4467f4e2931c4e620eb4d0c9595ca54e3dde2f59c225e69d2f"
  }) {
    id
    status
    payoutAddress
    metaPtr {
      protocol
      pointer
    }
    round {
      id
    }
  }
}
```