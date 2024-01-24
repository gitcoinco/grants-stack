import { VerifiableCredential as PassportVerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import _fetch from "cross-fetch";
import { request } from "graphql-request";
import shuffle from "knuth-shuffle-seeded";
import * as categories from "./backends/categories";
import * as collections from "./backends/collections";
import * as legacy from "./backends/legacy";
import { PaginationInfo } from "./data-layer.types";
import {
  Collection,
  ProjectEventsMap,
  ProjectRole,
  Round,
  RoundOverview,
  SearchBasedProjectCategory,
  TimestampVariables,
  v2Project,
} from "./data.types";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
  SearchResult,
} from "./openapi-search-client/index";
import {
  getProjectById,
  getProjects,
  getProjectsAndRolesByAddress,
} from "./queries";

export class DataLayer {
  private searchResultsPageSize: number;
  private searchApiClient: SearchApi;
  private subgraphEndpointsByChainId: Record<number, string>;
  private ipfsGateway: string;
  private passportVerifier: PassportVerifier;
  private collectionsSource: collections.CollectionsSource;
  private gsIndexerEndpoint: string;

  constructor({
    fetch,
    search,
    subgraph,
    indexer,
    ipfs,
    passport,
    collections,
  }: {
    fetch?: typeof _fetch;
    search: {
      pagination?: { pageSize: number };
      baseUrl: string;
    };
    subgraph?: {
      endpointsByChainId: Record<number, string>;
    };
    indexer: {
      baseUrl: string;
    };
    // TODO reflect that we specifically require Pinata?
    ipfs?: {
      gateway: string;
    };
    passport?: {
      verifier: PassportVerifier;
    };
    collections?: {
      googleSheetsUrl: string;
    };
  }) {
    this.searchApiClient = new SearchApi(
      new SearchApiConfiguration({
        fetchApi: fetch,
        basePath: search.baseUrl,
      }),
    );
    this.searchResultsPageSize = search.pagination?.pageSize ?? 10;
    this.subgraphEndpointsByChainId = subgraph?.endpointsByChainId ?? {};
    this.ipfsGateway = ipfs?.gateway ?? "https://ipfs.io";
    this.passportVerifier = passport?.verifier ?? new PassportVerifier();
    this.collectionsSource =
      collections?.googleSheetsUrl === undefined
        ? { type: "hardcoded" }
        : { type: "google-sheet", url: collections.googleSheetsUrl };
    this.gsIndexerEndpoint = indexer.baseUrl;
  }

  /**
   * Allo v1 & v2 builder queries
   */

  /**
   * getProjectById() returns a project by its ID.
   *
   * @param projectId
   * @param chainId
   * @param alloVersion
   * @returns v2Project | Project
   */
  async getProjectById({
    projectId,
    chainId,
    alloVersion,
  }: {
    projectId: string;
    chainId: number;
    alloVersion: string;
  }): Promise<{ project: v2Project } | null> {
    const requestVariables = {
      alloVersion,
      projectId,
      chainId,
    };

    console.log("requestVariables", requestVariables);

    // fixme: any
    const response: any = await request(
      this.gsIndexerEndpoint,
      getProjectById,
      requestVariables,
    );

    // todo: response is null ^ the variables are fine. why is the response null?
    // I noticed when we set the env to v2, on creation it still created a v1 project.
    console.log("response", response);

    const project = response.projects[0];

    console.log("project", project);

    if (!project) return null;

    return { project };
  }

  /**
   * getProjects() returns a list of projects.
   *
   * @param chainIds
   * @param first
   * @param alloVersion
   *
   * @returns v2Projects[] | null
   */
  async getProjects({
    chainIds,
    first,
    alloVersion,
  }: {
    chainIds: number[];
    first: number;
    alloVersion: string;
  }): Promise<{ projects: v2Project[] } | null> {
    const projects: v2Project[] = [];

    for (const chainId of chainIds) {
      const requestVariables = {
        alloVersion,
        first,
        chainId,
      };

      const profilesData: v2Project = await request(
        this.gsIndexerEndpoint,
        getProjects,
        requestVariables,
      );

      projects.push(profilesData);
    }

    return {
      projects,
    };
  }

  // getProjectsByAddress
  /**
   * getProjectsByAddress() returns a list of projects by address.
   * @param address
   * @param chainId
   * @param role
   */
  async getProjectsByAddress({
    address,
    alloVersion,
    chainId,
  }: {
    address: string;
    alloVersion: string;
    chainId: number;
  }): Promise<ProjectEventsMap | undefined> {
    const requestVariables = {
      address: address.toLowerCase(),
      chainId,
      alloVersion,
    };

    try {
      const response: any = await request(
        this.gsIndexerEndpoint,
        getProjectsAndRolesByAddress,
        requestVariables,
      );

      console.log("roles response", response);

      const projectRoles: ProjectRole[] = response.projectRoles;

      if (!projectRoles) return undefined;

      let projectEventsMap: ProjectEventsMap = {};

      for (const projectRole of projectRoles) {
        const project = projectRole.project;

        console.log("projectRole", projectRole);

        projectEventsMap[
          `${project.chainId}:${project.registryAddress}:${
            alloVersion === "allo-v2"
              ? projectRole.projectId
              : project.projectNumber
          }`
        ] = {
          createdAtBlock: Number(project.createdAtBlock),
          updatedAtBlock: Number(project.createdAtBlock), // todo: fix once updatedAtBlock is available
        };
      }

      return projectEventsMap;
    } catch (error) {
      console.error("Error fetching project roles", error);

      return undefined;
    }
  }

  /**
   * Legacy - Allo v1 queries
   */

  async searchApplications({
    queryString,
    page,
  }: {
    queryString: string;
    page: number;
  }): Promise<{
    results: SearchResult[];
    pagination: PaginationInfo;
  }> {
    const { results } = await this.searchApiClient.searchSearchGet({
      q: queryString,
    });
    const pageStart = page * this.searchResultsPageSize;
    const pageEnd = pageStart + this.searchResultsPageSize;
    const pageResults = results.slice(pageStart, pageEnd);
    return {
      results: pageResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(results.length / this.searchResultsPageSize),
        totalItems: results.length,
      },
    };
  }

  async getApplicationsPaginated({
    page,
    order,
    filter,
  }: {
    page: number;
    order?:
      | {
          type: "createdAtBlock" | "contributorCount" | "contributionsTotalUsd";
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
  }): Promise<{
    applications: ApplicationSummary[];
    pagination: PaginationInfo;
  }> {
    const { applicationSummaries } =
      await this.searchApiClient.getApplicationsApplicationsGet();
    const pageStart = page * this.searchResultsPageSize;
    const pageEnd = pageStart + this.searchResultsPageSize;
    let filteredApplicationSummaries: ApplicationSummary[] =
      applicationSummaries;

    if (filter?.type === "chains") {
      filteredApplicationSummaries = applicationSummaries.filter((a) =>
        filter.chainIds.includes(a.chainId),
      );
    } else if (filter?.type === "refs") {
      filteredApplicationSummaries = applicationSummaries.filter((a) =>
        filter.refs.includes(a.applicationRef),
      );
    }

    let orderedApplicationSummaries = filteredApplicationSummaries;
    if (order?.type === "random") {
      orderedApplicationSummaries = shuffle(
        filteredApplicationSummaries,
        order.seed,
      );
    } else if (order) {
      orderedApplicationSummaries = [...filteredApplicationSummaries].sort(
        (a, b) =>
          order.direction === "asc"
            ? a[order.type] - b[order.type]
            : b[order.type] - a[order.type],
      );
    }

    const applicationsPage = orderedApplicationSummaries.slice(
      pageStart,
      pageEnd,
    );

    return {
      applications: applicationsPage,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(
          filteredApplicationSummaries.length / this.searchResultsPageSize,
        ),
        totalItems: filteredApplicationSummaries.length,
      },
    };
  }

  async getLegacyRoundById({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<{ round: Round }> {
    const graphqlEndpoint = this.subgraphEndpointsByChainId[chainId];
    if (!graphqlEndpoint) {
      throw new Error(`No Graph endpoint defined for chain id ${chainId}`);
    }
    return {
      round: await legacy.getRoundById(
        { roundId, chainId },
        { graphqlEndpoint, ipfsGateway: this.ipfsGateway },
      ),
    };
  }

  async getLegacyRounds({
    chainIds,
    first,
    orderBy,
    orderDirection,
    where,
  }: {
    chainIds: number[];
    first: number;
    orderBy?:
      | "createdAt"
      | "matchAmount"
      | "roundStartTime"
      | "roundEndTime"
      | "applicationsStartTime"
      | "applicationsEndTime";
    orderDirection?: "asc" | "desc";
    where?: {
      and: [
        { or: TimestampVariables[] },
        { payoutStrategy_?: { or: { strategyName: string }[] } },
      ];
    };
  }): Promise<{ rounds: RoundOverview[] }> {
    return {
      rounds: await legacy.getRounds(
        {
          chainIds,
          first,
          orderBy,
          orderDirection,
          where,
        },
        {
          graphqlEndpoints: this.subgraphEndpointsByChainId,
        },
      ),
    };
  }

  async verifyPassportCredential(
    credential: PassportVerifiableCredential,
  ): Promise<{ isVerified: boolean }> {
    return {
      isVerified: await this.passportVerifier.verifyCredential(credential),
    };
  }

  async getProjectCollections(): Promise<Collection[]> {
    return await collections.getCollections({
      source: this.collectionsSource,
    });
  }

  async getProjectCollectionById(id: string): Promise<Collection | null> {
    return await collections.getCollectionById(id, {
      source: this.collectionsSource,
    });
  }

  async getSearchBasedCategories(): Promise<SearchBasedProjectCategory[]> {
    return await categories.getSearchBasedCategories();
  }

  async getSearchBasedCategoryById(
    id: string,
  ): Promise<SearchBasedProjectCategory | null> {
    return await categories.getSearchBasedCategoryById(id);
  }
}
