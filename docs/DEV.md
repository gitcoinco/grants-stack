## Development

This section documents the basic instructions on running / developing the frontend apps - round-manager, builder and grant-explorer.

### Pre Requisites

Before running any command, make sure to install dependencies. This installs dependencies for the whole monorepo.

```sh
$ pnpm install
```

```sh
cp .env.example .env
```

The .env file will be prefilled with some static and public variables. For the ones that are empty, please create accounts and fill in your personal API keys for the respective services.

### Run in Development

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

```sh
$ pnpm start
```

### Linting and formatting

We use Prettier for formatting and ESLint for linting. Prettier will auto-format your code before you commit, and linting will run before you push back to remote. The git hook config lies in the `lefthook.yml` file in the root of the repo.

### Testing

`pnpm test` will always run tests in whatever package you're in. We are migrating from Jest to Vitest on all the packages. If you encounter any issues with Jest, consult the [Knowledge base file](KB.md).

### Run in Production

Builds the app for production to the `build` folder.

```sh
$ pnpm build
```

Serve on port 3000

```sh
$ pnpm install -g serve
$ serve -s build -l 3000
```

### Adding a new route

Global routing configuration is held in `src/index.tsx`. Below is an example of a route definition

```jsx=
<Route path="/program/create" element={<CreateProgram />} />
<Route path="/program/:id" element={<ViewProgram />} />
```

A protected route i.e a routed which requires a user's wallet connection should be within the parent `ProtectedRoute`
component route

```jsx=
<Route element={<ProtectedRoute />}>
    <Route path="/program/create" element={<CreateProgram />} />
    <Route path="/program/:id" element={<ViewProgram />} />
</Route>
```

Find more information about routing [here](https://reactrouter.com/docs/en/v6).

## Submitting for review

We have git hook
