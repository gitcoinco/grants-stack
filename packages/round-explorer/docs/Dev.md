## Development Instructions

### Directory Structure 

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
├── tsconfig.json               # Typescript documentation 
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

### Adding a new route
Global routing configuration is held in `src/index.tsx`. Below is an example of a route definition

```jsx=
<Route path="/program/create" element={<CreateProgram />} />
<Route path="/program/:id" element={<ViewProgram />} />
```

A protected route i.e a routed which requires a user's wallet connection should be within the parent `ProtectedRoute` component route

```jsx=
<Route element={<ProtectedRoute />}>
    <Route path="/program/create" element={<CreateProgram />} />
    <Route path="/program/:id" element={<ViewProgram />} />
</Route>
```

Find more information about routing [here](https://reactrouter.com/docs/en/v6).


### Creating a new feature
This is as easy as creating a new folder in the `features` directory that holds all the resources for that particular feature.

The directory structure requires that all components and services which are related to a particular feature be kept in a subdirectory of the `features` directory.

Observe the directory structure for Authentication feature in `features/auth`

```
├── features
│   ├── auth
│   │   ├── ProtectedRoute.tsx
│   │   ├── web3Service.tsx
```

It contains the `ProtectedRoute` component and `web3Service` which extends the base API service defined in `src/api.ts` by endpoint injection.

### Defining a new API
Some features require server-side state management which involves keeping the UI in sync with an external data source e.g REST/GraphQL API service, Smart Contract etc. We use [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) which is

> a powerful data fetching and caching tool. It is designed to simplify common cases for loading data in a web application, eliminating the need to hand-write data fetching & caching logic yourself

All queries and mutations inject endpoints into the base API `src/api.ts`

```typescript=
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

// initialize an empty api service that we'll inject endpoints into later as needed
export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<string>(),
  endpoints: () => ({}),
})
```

web3Service.tsx

```typescript=
export const web3Api = api.injectEndpoints({
  endpoints: (builder) => ({
    getWeb3: builder.query<Web3Instance, void>({
      queryFn: async () => {
        ...
      },
    }),
  }),
  overrideExisting: false
})

export const { useGetWeb3Query } = web3Api
```

UI components access data and states thus,

```jsx=
const { data, error, refetch, isSuccess, isFetching, isLoading } = useGetWeb3Query()
```

### Tools
[Redux Toolkit](https://redux-toolkit.js.org/)
[RTK Query](https://redux-toolkit.js.org/tutorials/rtk-query)
[React Hook Form](https://react-hook-form.com/get-started)