import {
  SearchResult,
  ApplicationSummary,
} from "./openapi-search-client/models/index.js";

export type DataClientInteraction =
  | {
      query: { type: "applications-search"; queryString: string; page: number };
      response: {
        results: SearchResult[];
        pagination: PaginationInfo;
      };
    }
  | {
      query: { type: "applications-by-refs"; refs: string[] };
      response: {
        applications: ApplicationSummary[];
      };
    }
  | {
      query: {
        type: "applications-paginated";
        page: number;
        order?:
          | {
              type:
                | "createdAtBlock"
                | "contributorCount"
                | "contributionsTotalUsd";
              direction: "asc" | "desc";
            }
          | { type: "random"; seed: number };
        filter?:
          | {
              type: "chains";
              chainIds: number[];
            }
          | {
              type: "refs";
              refs: string[];
            };
      };
      response: {
        applications: ApplicationSummary[];
        pagination: PaginationInfo;
      };
    };

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export type ExtractQuery<I, T> = Extract<I, { query: { type: T } }>["query"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractResponse<I extends { response: any }, T> = Extract<
  I,
  { query: { type: T } }
>["response"];
