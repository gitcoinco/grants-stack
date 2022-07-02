# round-manager

This package serves the app which holds all the features w.r.t to 

- creating a program
- maintaing a program
- creating a round
- maintaining a program

This package is meant to be used by the round operators 
It relies on the contracts deployed from the [contracts](https://github.com/gitcoinco/grants-round/tree/main/packages/contracts) package.
Indexed data can be queried by the graphs deployed from the [graph](https://github.com/gitcoinco/grants-round/tree/main/packages/graph) package.

## Directory Structure 

```
.
├── public                      # Public Assets
├── src
│   ├── app                     # Stores/Hooks
│   ├── features
│       ├── auth                # components/services related to authentication/authorization
│       ├── program             # Program related components/services
│       ├── round               # Round related components/services 
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


### Development

To contribute to this project, fork the project and follow the instructions at [DEV.md](https://github.com/gitcoinco/grants-round/blob/main/packages/round-manager/docs/DEV.md)