# round-explorer

This package serves the app which holds all the features w.r.t to 

- exploring a round
- voting for a project

This package is meant to be used by the users who would wnat to explore rounds and contribute to the projects within a round
It relies on the contracts deployed from the [contracts](../contracts) package.
Indexed data can be queried by the graphs deployed from the [graph](../graph) package.


### Directory Structure 

```
.
├── public                      # Public Assets
├── src
│   ├── app                     # Stores/Hooks
│   ├── features
│       ├── auth                # components/services related to authentication/authorization
│       ├── explorer            # Explorer related components/services
│       ├── cart                # Cart related components/services 
│   ├── api.ts                  # Empty API service (feature APIs will inject endpoints)
│   ├── browserPatches.tsx      # Browser polyfill
│   ├── index.tsx               # Routes
│   ├── index.css               # Global CSS
├── tsconfig.json               # Typescript configuration 
├── craco.json                  # Craco configuration
├── package.json                # Package configuration
└── README.md
```

The app structure ensures all components and services related to a particular feature are kept in a subdirectory of the `features` directory.

Observe the directory structure for Authentication feature in `features/auth`

```
├── features
│   ├── auth
│   │   ├── ProtectedRoute.tsx
│   │   ├── web3Service.tsx
```

It contains the `ProtectedRoute` component and `web3Service` which extends the base API service defined in `src/api.ts` by endpoint injection.

## Development

To contribute to this project, fork the project and follow the instructions at [DEV.md](docs/DEV.md)