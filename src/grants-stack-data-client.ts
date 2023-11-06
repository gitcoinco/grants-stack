import { UnreachableCaseError } from "ts-essentials";
import _fetch from "cross-fetch";
import {
  DataClientInteraction,
  ExtractQuery,
  ExtractResponse,
} from "./grants-stack-data-client.types.js";
import * as searchApi from "./openapi-search.js";

export class GrantsStackDataClient {
  private fetch: typeof _fetch;
  private pageSize: number;
  private baseUrl: string;

  constructor({
    fetch,
    baseUrl,
    applications,
  }: {
    fetch?: typeof _fetch;
    applications?: { pagination: { pageSize: number } };
    baseUrl: string;
  }) {
    this.pageSize = applications?.pagination.pageSize ?? 10;
    this.fetch = fetch ?? _fetch;
    this.baseUrl = baseUrl;
  }

  async query(
    q: ExtractQuery<DataClientInteraction, "applications-by-refs">,
  ): Promise<ExtractResponse<DataClientInteraction, "applications-by-refs">>;
  async query(
    q: ExtractQuery<DataClientInteraction, "applications-paginated">,
  ): Promise<ExtractResponse<DataClientInteraction, "applications-paginated">>;
  async query(
    q: ExtractQuery<DataClientInteraction, "applications-search">,
  ): Promise<ExtractResponse<DataClientInteraction, "applications-search">>;
  async query(
    q: DataClientInteraction["query"],
  ): Promise<DataClientInteraction["response"]> {
    switch (q.type) {
      case "applications-search": {
        const { results } = await searchApi.searchSearchGet(q.queryString, {
          fetch: this.fetch,
          baseUrl: this.baseUrl,
        });

        return { results };
      }

      case "applications-by-refs": {
        const { applicationSummaries } =
          await searchApi.getApplicationsApplicationsGet({
            fetch: this.fetch,
            baseUrl: this.baseUrl,
          });

        return {
          applications: applicationSummaries.filter((a) =>
            q.refs.includes(a.applicationRef),
          ),
        };
      }

      case "applications-paginated": {
        const { applicationSummaries } =
          await searchApi.getApplicationsApplicationsGet({
            fetch: this.fetch,
            baseUrl: this.baseUrl,
          });

        const pageStart = q.page * this.pageSize;
        const pageEnd = pageStart + this.pageSize;

        return {
          applications: applicationSummaries.slice(pageStart, pageEnd),
          pagination: {
            currentPage: q.page,
            totalPages: Math.ceil(applicationSummaries.length / this.pageSize),
            totalItems: applicationSummaries.length,
          },
        };
      }

      default:
        throw new UnreachableCaseError(q);
    }
  }
}
