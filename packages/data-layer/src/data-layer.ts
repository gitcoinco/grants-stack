import shuffle from "knuth-shuffle-seeded";
import { UnreachableCaseError } from "ts-essentials";
import _fetch from "cross-fetch";
import {
  DataLayerInteraction,
  ExtractQuery,
  ExtractResponse,
} from "./data-layer.types.js";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
} from "./openapi-search-client/index.js";

export class DataLayer {
  private searchResultsPageSize: number;
  private searchApiClient: SearchApi;

  constructor({
    fetch,
    search,
  }: {
    fetch?: typeof _fetch;
    search: {
      pagination?: { pageSize: number };
      baseUrl: string;
    };
  }) {
    this.searchApiClient = new SearchApi(
      new SearchApiConfiguration({
        fetchApi: fetch,
        basePath: search.baseUrl,
      }),
    );
    this.searchResultsPageSize = search.pagination?.pageSize ?? 10;
  }

  async query(
    q: ExtractQuery<DataLayerInteraction, "applications-by-refs">,
  ): Promise<ExtractResponse<DataLayerInteraction, "applications-by-refs">>;
  async query(
    q: ExtractQuery<DataLayerInteraction, "applications-paginated">,
  ): Promise<ExtractResponse<DataLayerInteraction, "applications-paginated">>;
  async query(
    q: ExtractQuery<DataLayerInteraction, "applications-search">,
  ): Promise<ExtractResponse<DataLayerInteraction, "applications-search">>;
  async query(
    q: DataLayerInteraction["query"],
  ): Promise<DataLayerInteraction["response"]> {
    switch (q.type) {
      case "applications-search": {
        const { results } = await this.searchApiClient.searchSearchGet({
          q: q.queryString,
        });

        // TODO consider unifying with /applications endpoint
        const pageStart = q.page * this.searchResultsPageSize;
        const pageEnd = pageStart + this.searchResultsPageSize;
        const page = results.slice(pageStart, pageEnd);

        return {
          results: page,
          pagination: {
            currentPage: q.page,
            totalPages: Math.ceil(results.length / this.searchResultsPageSize),
            totalItems: results.length,
          },
        };
      }

      case "applications-by-refs": {
        const { applicationSummaries } =
          await this.searchApiClient.getApplicationsApplicationsGet();

        return {
          applications: applicationSummaries.filter((a) =>
            q.refs.includes(a.applicationRef),
          ),
        };
      }

      case "applications-paginated": {
        const { applicationSummaries } =
          await this.searchApiClient.getApplicationsApplicationsGet();

        const pageStart = q.page * this.searchResultsPageSize;
        const pageEnd = pageStart + this.searchResultsPageSize;

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
              filteredApplicationSummaries.length / this.searchResultsPageSize,
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
