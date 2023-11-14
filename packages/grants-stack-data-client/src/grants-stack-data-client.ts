import shuffle from "knuth-shuffle-seeded";
import { UnreachableCaseError } from "ts-essentials";
import _fetch from "cross-fetch";
import {
  DataClientInteraction,
  ExtractQuery,
  ExtractResponse,
} from "./grants-stack-data-client.types.js";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
} from "./openapi-search-client/index.js";

export class GrantsStackDataClient {
  private pageSize: number;
  private searchApi: SearchApi;

  constructor({
    fetch,
    baseUrl,
    pagination,
  }: {
    fetch?: typeof _fetch;
    pagination?: { pageSize: number };
    baseUrl: string;
  }) {
    this.searchApi = new SearchApi(
      new SearchApiConfiguration({
        fetchApi: fetch,
        basePath: baseUrl,
      }),
    );
    this.pageSize = pagination?.pageSize ?? 10;
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

        // TODO consider unifying with /applications endpoint
        const pageStart = q.page * this.pageSize;
        const pageEnd = pageStart + this.pageSize;
        const page = results.slice(pageStart, pageEnd);

        return {
          results: page,
          pagination: {
            currentPage: q.page,
            totalPages: Math.ceil(results.length / this.pageSize),
            totalItems: results.length,
          },
        };
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

        let filteredApplicationSummaries: ApplicationSummary[];
        if (q.filter === undefined) {
          filteredApplicationSummaries = applicationSummaries;
        } else if (q.filter.type === "chains") {
          const { chainIds } = q.filter;
          filteredApplicationSummaries = applicationSummaries.filter((a) =>
            chainIds.includes(a.chainId),
          );
        } else if (q.filter.type === "refs") {
          const { refs } = q.filter;
          filteredApplicationSummaries = applicationSummaries.filter((a) =>
            refs.includes(a.applicationRef),
          );
        } else {
          throw new Error(`Unreachable brank invoked`);
        }

        let orderedApplicationSummaries: ApplicationSummary[];
        if (q.order === undefined) {
          orderedApplicationSummaries = filteredApplicationSummaries;
        } else if (q.order.type === "random") {
          orderedApplicationSummaries = shuffle(
            filteredApplicationSummaries,
            q.order.seed,
          );
        } else {
          const { direction, type: property } = q.order;
          orderedApplicationSummaries = [...filteredApplicationSummaries].sort(
            (a, b) =>
              direction === "asc"
                ? a[property] - b[property]
                : b[property] - a[property],
          );
        }

        const page = orderedApplicationSummaries.slice(pageStart, pageEnd);

        return {
          applications: page,
          pagination: {
            currentPage: q.page,
            totalPages: Math.ceil(
              filteredApplicationSummaries.length / this.pageSize,
            ),
            totalItems: filteredApplicationSummaries.length,
          },
        };
      }

      default:
        throw new UnreachableCaseError(q);
    }
  }
}
