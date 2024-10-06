## Development

To run tests in watch mode:

```sh
pnpm run test:watch
```

To update types from the [search service](https://gitcoin-search-dev.fly.dev/docs), run:

```sh
pnpm run generate:openapi
```

## Example

```ts
import { DataLayer } from "data-layer";

const gsData = new DataLayer({
  search: {
    baseUrl: "https://gitcoin-search-dev.fly.dev",
  },
});

const { applications, pagination } = await gsData.query({
  type: "applications-paginated",
  page: 0,
});

// Example usage of getMintingAttestationIdsByTransactionHash
const transactionHashes = ["0x1234567890abcdef"]; // Replace with a valid transaction hash
const { data: attestations } =
  await gsData.getMintingAttestationIdsByTransactionHash({
    transactionHashes,
  });
```

For more examples, see `src/data-layer.test.ts`.
