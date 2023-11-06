import shuffle from "knuth-shuffle-seeded";
import { UnreachableCaseError } from "ts-essentials";
import _fetch from "cross-fetch";
import {
  DataClientInteraction,
  ExtractQuery,
  ExtractResponse,
} from "./grants-stack-data-client.types.js";
import {
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
} from "./openapi-search-client/index.js";

export class GrantsStackDataClient {
  private pageSize: number;
  private searchApi: SearchApi;

  constructor({
    fetch,
    baseUrl,
    applications,
  }: {
    fetch?: typeof _fetch;
    applications?: { pagination: { pageSize: number } };
    baseUrl: string;
  }) {
    this.searchApi = new SearchApi(
      new SearchApiConfiguration({
        fetchApi: fetch,
        basePath: baseUrl,
      }),
    );
    this.pageSize = applications?.pagination.pageSize ?? 10;
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
        const { results } = await this.searchApi.searchSearchGet({
          q: q.queryString,
        });

        return { results };
      }

      case "applications-by-refs": {
        const { applicationSummaries } =
          await this.searchApi.getApplicationsApplicationsGet();

        return {
          applications: applicationSummaries.filter((a) =>
            q.refs.includes(a.applicationRef),
          ),
        };
      }

      case "applications-paginated": {
        const { applicationSummaries } =
          await this.searchApi.getApplicationsApplicationsGet();

        const pageStart = q.page * this.pageSize;
        const pageEnd = pageStart + this.pageSize;

        const page = (
          q.shuffle === undefined
            ? applicationSummaries
            : shuffle(applicationSummaries, q.shuffle.seed)
        ).slice(pageStart, pageEnd);

        return {
          applications: page,
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
