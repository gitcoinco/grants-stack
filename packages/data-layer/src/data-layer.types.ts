import { VerifiableCredential as PassportVerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { CustomError } from "ts-custom-error";
import {
  SearchResult,
  ApplicationSummary,
} from "./openapi-search-client/models/index";
import {
  Collection,
  Round,
  RoundOverview,
  SearchBasedProjectCategory,
  TimestampVariables,
} from "./data.types";

export type DataLayerInteraction =
  | {
      query: { type: "applications-search"; queryString: string; page: number };
      response: {
        results: SearchResult[];
        pagination: PaginationInfo;
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
    }
  | {
      query: { type: "legacy-round-by-id"; roundId: string; chainId: number };
      response: { round: Round };
    }
  | {
      query: {
        type: "legacy-rounds";
        chainIds: number[];
        // We need to overfetch these because many will be filtered out from the metadata.roundType === "public"
        // The `first` param in the arguments will instead be used last to limit the results returned
        first: number;
        orderBy?:
          | "createdAt"
          | "matchAmount"
          | "roundStartTime"
          | "roundEndTime"
          | "applicationsStartTime"
          | "applicationsEndTime"
          | undefined;
        orderDirection?: "asc" | "desc" | undefined;
        where?:
          | {
              and: [
                { or: TimestampVariables[] },
                { payoutStrategy_?: { or: { strategyName: string }[] } },
              ];
            }
          | undefined;
      };
      response: { rounds: RoundOverview[] };
    }
  | {
      query: {
        type: "verify-passport-credential";
        credential: PassportVerifiableCredential;
      };
      response: { isVerified: boolean };
    }
  | {
      query: { type: "search-based-project-categories" };
      response: { categories: SearchBasedProjectCategory[] };
    }
  | {
      query: { type: "search-based-project-category"; id: string };
      response: { category: SearchBasedProjectCategory | null };
    }
  | {
      query: { type: "project-collections" };
      response: { collections: Collection[] };
    }
  | {
      query: { type: "project-collection"; id: string };
      response: { collection: Collection | null };
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

export class NotImplementedError extends CustomError {
  public constructor(message?: string) {
    super(message ?? "Not implemented");
  }
}
