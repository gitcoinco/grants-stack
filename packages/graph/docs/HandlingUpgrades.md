#### Updating subgraph to accomodate contract changes

This document entails how to update subgraph during contract upgrades to ensure

- how to handle indexing event from the legacy ABI version
- how to handle indexing event from the new ABI version
- how the same subgraph can be used to index all variations
- how the files need to be renamed / restructed
- what documentation needs to be added


#### Steps to upgrade


Note: Anytime an enitity is updated with a new property. Increment the version property to make it easier for other services to handler backward compatibility. If the subgraph entity doesn't have version defined, default it to `0.1.0`.

Let's assume we are updating `QuadraticFundingVotingStrategyImplementation`

**PreRequisites**
1. Ensure the `QuadraticFundingVotingStrategyImplementation` contract changes are done and abi is genered from `packages/contract`

**Update schema.graphql**
1. Make changes to the schema.graphql (if applicable) BUT this would mean the old handlers would need to be updated with logic on how to populate the new enitity / new property of an enitity
(note: if you cannot update the old handler -> then set the field as optional in schema.graphql )

Note: To keep data consistent, always attempt to update the older handler to backfill the new data added to keep responses consistent

**Migrate Old Abi + Handler + Test**
1. Move the current abi from `abis/QuadraticFundingVotingStrategyImplementation.json` to `abis/legacy/QuadraticFundingVotingStrategyImplementation/V1.json`. ( note: do not overwrite existing legacy abi, always name the file as the latest abi version. Ex: V1, V2,..., Vn )

2. Move the current handler from `src/votingStrategy/quadraticFunding/implementation.ts` to `src/legacy/votingStrategy/quadraticFunding/implementationLegacyV1.ts`.
Add documentation in the following format to ensure we track history
```js
// name     : implementation.ts
// status   : legacy
// version  : v1
// abi      : abis/legacy/QuadraticFundingVotingStrategyImplementation/V1.json
// reason   : Vote event is being updated to add a new parameter.
//            This results in an contract upgrade + ABI change
//            This implementation is being updated to set projectId as
//            the to address (the address to which the funds are sent to)
```

3. Move the current test from `tests/votingStrategy/quadraticFunding/implementation.test.ts` to `tests/legacy/votingStrategy/quadraticFunding/implementationLegacyV1.test.ts`.

**Add new Abi + Handler + Test**
1. Add the new abi to `abis/QuadraticFundingVotingStrategyImplementation.json`

2. Add the new handler to `src/votingStrategy/quadraticFunding/implementation.ts`

3. Add the new test to `tests/votingStrategy/quadraticFunding/implementation.test.ts`

**Update subgraph.template.yaml**

This comprises of two steps:

1. Moving the current ABI + handler to the end of file (under the legacy section) and renaming them:
    - Move the template of `QuadraticFundingVotingStrategyImplementation` to the legacy ABI section (at the bottom of the file).
    - Update the name to `QuadraticFundingVotingStrategyImplementationLegacyV1`
    - Update the abi to `abis/legacy/QuadraticFundingVotingStrategyImplementation/V1.json`
    - Update the handler to `src/legacy/votingStrategy/quadraticFunding/implementationLegacyV1.ts`

2. Create a new template for the new abi and map it to the latest abi + handler

**WrapUp**
1. Once all the tests pass, deploy the changes onto a dummy subgraph and validate to ensure both old and new data continues to be indexed, roll out the deploy onto

Note: Grafting is a last resort. Look into it only under the scenario when you cannot afford waste time to have the graph re-indexed (due to business reason)