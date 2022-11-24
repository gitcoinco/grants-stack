# api

This package is pulumi configured app which offers API / endpoints to:

- calculate the matching distribution for a given round based on the voting strategy   
- store the results of a calculations
- return the latest distribution of funds within the round
- return a specifc project's matching amount within a round

This package is meant to be used by the round operators to
- view how the matching funds distributions evolve during the course of a round
- determine how the funds should be split amongst the projects based on the votes recieved

Indexed data can be queried by the graphs deployed from the [graph](../graph) package.

## Directory Structure

```
.
├── src
│   ├── votingStrategies
│       ├── linearQuadraticFunding.ts   # fetching QF votes + compute matching via linear QF
│   ├── utils.ts                        # Helper functions
│   ├── index.ts                        # Orchestrator Logic
├── index.ts                            # Routes
├── Pulumi.dev.yaml                     # Pulumi AWS configuration
├── Pulumi.yaml                         # Pulumi configuration
├── package.json                        # Package configuration
└── README.md
```

### Development

- Install Pulumi and login into the account via the console
- Ensure your `AWS` env are setup
- Once your changes are done -> roll them onto the pulumi server using `pulumi up`
- If deploy crashes midway, before running `pulumi up`, run `pulumi refresh` to clean previous incomplete deploy
