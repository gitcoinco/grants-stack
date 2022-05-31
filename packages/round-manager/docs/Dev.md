## Development Instructions

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Run Development Server

Generate the code coverage report:

```sh
$ yarn start
```

### Run in Production

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

```sh
$ yarn build
```

Serve on port 3000

```sh
$ npm install -g serve
$ serve -s build -l 3000
```