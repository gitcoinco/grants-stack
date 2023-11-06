## Development

To run tests in watch mode:

```sh
pnpm run test:watch
```

To update types from the [search service](https://gitcoin-search-dev.fly.dev/docs), run:

```sh
pnpm run generate:openapi-search
```

## Example

```ts
import { GrantsStackDataClient } from "grants-stack-data-client";

const gsData = new GrantsStackDataClient({
  baseUrl: "https://gitcoin-search-dev.fly.dev",
});

const { applications, pagination } = await gsData.query({
  type: "applications-paginated",
  page: 0,
});
```

For more examples, see `src/grants-stack-data-client.test.ts`.
