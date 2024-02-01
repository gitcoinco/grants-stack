import { VerifiableCredential as PassportVerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import _fetch from "cross-fetch";
import { request } from "graphql-request";
import shuffle from "knuth-shuffle-seeded";
import * as categories from "./backends/categories";
import * as collections from "./backends/collections";
import * as legacy from "./backends/legacy";
import { AlloVersion, PaginationInfo } from "./data-layer.types";
import {
  Collection,
  Program,
  ProjectApplication,
  ProjectEventsMap,
  Round,
  RoundOverview,
  SearchBasedProjectCategory,
  TimestampVariables,
  V2Round,
  v2Project,
} from "./data.types";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
  SearchResult,
} from "./openapi-search-client/index";
import {
  getApplicationsByProjectId,
  getProgramName,
  getProgramsByUser,
  getProjectById,
  getProjects,
  getProjectsAndRolesByAddress,
  getRoundByIdAndChainId,
} from "./queries";

/**
 * DataLayer is a class that provides a unified interface to the various data sources.
 *
 * @remarks
 *
 * @public
 *
 * @param fetch - The fetch implementation to use for making HTTP requests.
 * @param search - The configuration for the search API.
 * @param subgraph - The configuration for the subgraph API.
 * @param indexer - The configuration for the indexer API.
 * @param ipfs - The configuration for the IPFS gateway.
 * @param passport - The configuration for the Passport verifier.
 * @param collections - The configuration for the collections source.
 *
 * @returns The DataLayer instance.
 */
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
   * Allo v1 & v2 manager queries
   */

  /**
   * Gets profiles/programs linked to an operator or user.
   *
   * @example
   * Here is an example:
   * ```
   * const program = await dataLayer.getProgramByUser({
   *  address: "0x1234",
   *  chainId: 1,
   *  alloVersion: "allo-v1",
   * });
   * ```
   * @param address - the address of the user.
   * @param chainId - the network ID of the chain.
   * @param alloVersion - the version of Allo to use.
   *
   * @returns Program
   */
  async getProgramsByUser({
    address,
    chainId,
    alloVersion,
  }: {
    address: string;
    chainId: number;
    alloVersion: AlloVersion;
  }): Promise<{ programs: Program[] } | null> {
    const requestVariables = {
      alloVersion,
      address,
      chainId,
    };

    const response: { projects: Program[] } = await request(
      this.gsIndexerEndpoint,
      getProgramsByUser,
      requestVariables,
    );

    const programs = response.projects;

    if (!programs) return null;

    return { programs };
  }

  /**
   * Allo v1 & v2 builder queries
   */

  /**
   * Gets a project by its ID.
   *
   * @example
   * Here is an example:
   * ```
   * const project = await dataLayer.getProjectById({
   *  projectId: "0x1234",
   *  chainId: 1,
   *  alloVersion: "allo-v2",
   * });
   * ```
   * @param projectId - the ID of the project to return.
   * @param chainId - the network ID of the chain.
   * @param alloVersion - the version of Allo to use.
   *
   * @returns v2Project | Project
   */
  async getProjectById({
    projectId,
    chainId,
    alloVersion,
  }: {
    projectId: string;
    chainId: number;
    alloVersion: AlloVersion;
  }): Promise<{ project: v2Project } | null> {
    const requestVariables = {
      alloVersion,
      projectId,
      chainId,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectById,
      requestVariables,
    );

    if (response.projects.length === 0) return null;

    const project = response.projects[0];

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
    alloVersion: AlloVersion;
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
    alloVersion: AlloVersion;
    chainId: number;
  }): Promise<ProjectEventsMap | undefined> {
    const requestVariables = {
      address: address.toLowerCase(),
      version: alloVersion,
      chainId,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectsAndRolesByAddress,
      requestVariables,
    );

    const projects: v2Project[] = response.projects;

    if (projects.length === 0) return undefined;

    const projectEventsMap: ProjectEventsMap = {};

    for (const project of projects) {
      projectEventsMap[
        `${chainId}:${project.registryAddress}:${
          alloVersion === "allo-v2" ? project.id : project.projectNumber
        }`
      ] = {
        createdAtBlock: Number(project.createdAtBlock),
        // todo: fix once updatedAtBlock is available
        updatedAtBlock: Number(project.createdAtBlock),
      };
    }

    return projectEventsMap;
  }

  // getApplicationsByProjectId
  /**
   * getApplicationsByProjectId() returns a list of projects by address.
   * @param projectId
   */
  async getApplicationsByProjectId({
    projectId,
    chainIds,
  }: {
    projectId: string;
    chainIds: number[];
  }): Promise<ProjectApplication[]> {
    const requestVariables = {
      projectId: projectId,
      chainIds: chainIds,
    };

    const response: { applications: ProjectApplication[] } = await request(
      this.gsIndexerEndpoint,
      getApplicationsByProjectId,
      requestVariables,
    );

    return response.applications ?? [];
  }

  async getProgramName({
    projectId,
  }: {
    projectId: string;
  }): Promise<string | null> {
    const requestVariables = {
      projectId,
    };

    const response: { projects: { metadata: { name: string } }[] } =
      await request(this.gsIndexerEndpoint, getProgramName, requestVariables);

    if (response.projects.length === 0) return null;

    const project = response.projects[0];

    return project.metadata.name;
  }

  async getRoundByIdAndChainId({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<V2Round> {

    const requestVariables = {
      roundId,
      chainId
    };

    const response : {rounds: V2Round[]} = 
    await request(this.gsIndexerEndpoint, getRoundByIdAndChainId, requestVariables);

    return response.rounds[0] ?? [];
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
