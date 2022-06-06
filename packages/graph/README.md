## Program

Fetch first 5 programs
```graphql
{
  programs(first: 5) {
    id
  }
}
```

Fetch roles & accounts having that role of all programs
```
{
  programs(first: 5) {
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



AUTO GENERATE
```shell
npx graph-compiler \
--config configs/test.json \
--include node_modules/@openzeppelin/subgraphs/src/datasources \
--export-schema \
--export-subgraph
```