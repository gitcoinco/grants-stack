## Round Application

This document covers how
- a round operator can set the application form
- a project can apply to a round (by filling the application form)
- a round operator can view applications & take action on them (approve / reject)
- a project application status can be retrieved at any given point in time

### Application Form Schema

During round creation, the operator will asked to define a list of questions of which round manager would generate a schema, store it in a decentralized storage and save the storage protcol and hash into the round contract

The application schema would be in the format as listed below:

```javascript
{
  "id"                      : "String",                 // round contract address
  "lastUpdatedOn"         : "Number",                 // epoch time in milliseconds
  "applicationSchema": [
    {
      "question"            : "String",
      "type"                : "String",                 // this will be a limited set [TEXT, TEXTAREA, RADIO, MULTIPLE]
      "required"            : "Boolean",
      "info"               ?: "String",                 // optional
      "choices"            ?: ["String"|"Number"]       // optional
    },
    {...}
  ]
}
```


Grants Hub can query the contract & retrieve the metaPtr via the `getApplicationMetaPtr` call and use the schema to generate the form for the project owner to fill and apply


### Notifying The Round of the Application

Once the project owner applies, GrantsHub would then upload the application form to a storage of it's choice and invoke `applyToRound` function passing the `metaPtr` where the filled application is stored.
The schema of the filled application form is defined HERE

// TODO: get schema from hub team

On invoking `applyToRound` with the `project` id and `applicationMetaPtr`, the contract emits an event `NewProjectApplication` which is then used by the subgraph to create the list of projects and index them.


### Structure of Project indexed by the project.

Anytime the `NewProjectApplication` event is fired, the subgraph responds to the event by creating a new Project and indexing it. The schema is defined here

// TODO: add link to schema


### Approving or rejecting applications

When the operators visits the review page, they would be able to see all the applications indexed by the graph, all in pending review state.

The operator would now be able to approve / reject the applications. Once the decision has been made.
The round manager saves this information to IPFS and invokes `updateProjectsMetaPtr` with the IPFS hash
which:
- updates the `projectsMetaPtr`
- fires the `ProjectsMetaPtrUpdated` event

This `projectsMetaPtr` contains a list of all projects which have either been rejected or approved.
Pending projects not be included here

// TODO : decide structure of `projectsMetaPtr` content

### How does the graph update the project indexing ?

The subgraph on recieving the `ProjectsMetaPtrUpdated` event would then fetch the `projectsMetaPtr` and update the project indexes and update the status from `pending` -> `approved` / `rejected`
