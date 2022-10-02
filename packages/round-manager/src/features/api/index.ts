import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

// initialize an empty api service that we'll inject endpoints into later as needed
export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ["Program", "Round", "GrantApplication", "IPFS"],
  endpoints: () => ({}),
});
