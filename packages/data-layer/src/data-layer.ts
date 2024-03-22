import { VerifiableCredential as PassportVerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import _fetch from "cross-fetch";
import { request } from "graphql-request";
import shuffle from "knuth-shuffle-seeded";
import { Address } from "viem";
import * as categories from "./backends/categories";
import * as collections from "./backends/collections";
import { AlloVersion, PaginationInfo } from "./data-layer.types";
import {
  Application,
  ApplicationStatus,
  Collection,
  GrantApplicationFormAnswer,
  OrderByRounds,
  Program,
  Project,
  ProjectApplicationForManager,
  ProjectApplicationWithRound,
  Round,
  RoundGetRound,
  RoundsQueryVariables,
  RoundWithApplications,
  SearchBasedProjectCategory,
  V2RoundWithProject,
  v2Project,
  RoundForManager,
  Contribution,
} from "./data.types";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
  SearchResult,
} from "./openapi-search-client/index";
import {
  getApplication,
  getApplicationsByProjectIds,
  getApplicationsByRoundIdAndProjectIds,
  getApplicationsForManager,
  getLegacyProjectId,
  getProgramById,
  getProgramsByUserAndTag,
  getProjectById,
  getProjectsAndRolesByAddress,
  getRoundByIdAndChainId,
  getRoundForManager,
  getRoundsForManager,
  getRoundByIdAndChainIdWithApprovedApplications,
  getRoundsQuery,
  getDonationsByDonorAddress,
} from "./queries";
import { mergeCanonicalAndLinkedProjects } from "./utils";

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
   * const program = await dataLayer.getProgramsByUser({
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
  }): Promise<{ programs: Program[] }> {
    const requestVariables = {
      userAddress: address.toLowerCase(),
      alloVersion,
      chainId,
    };

    const response: { projects: Program[] } = await request(
      this.gsIndexerEndpoint,
      getProgramsByUserAndTag,
      { ...requestVariables, tags: ["program", alloVersion] },
    );

    return { programs: response.projects };
  }

  async getProgramById({
    programId,
    chainId,
  }: {
    programId: string;
    chainId: number;
  }): Promise<{ program: Program | null }> {
    const response: { projects: (Program | v2Project)[] } = await request(
      this.gsIndexerEndpoint,
      getProgramById,
      { programId, chainId },
    );

    if (response.projects.length === 0) {
      return { program: null };
    }

    const projectOrProgram = response.projects[0];

    if ("name" in projectOrProgram.metadata) {
      return { program: projectOrProgram as Program };
    }

    return {
      program: {
        ...projectOrProgram,
        metadata: {
          name: projectOrProgram.metadata?.title,
        },
      },
    };
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
    alloVersion,
  }: {
    projectId: string;
    alloVersion: AlloVersion;
  }): Promise<{ project: v2Project } | null> {
    const requestVariables = {
      alloVersion,
      projectId,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectById,
      requestVariables,
    );

    if (response.projects.length === 0) return null;

    const project = mergeCanonicalAndLinkedProjects(response.projects)[0];

    return { project };
  }

  /**
   * Gets a legacy project ID by its Allo v2 ID.
   * @param projectId - the Allo v2 ID of the project.
   * @returns string | null
   */
  async getLegacyProjectId({
    projectId,
  }: {
    projectId: string;
  }): Promise<string | null> {
    const response: { legacyProjects: { v1ProjectId: string }[] } =
      await request(this.gsIndexerEndpoint, getLegacyProjectId, { projectId });

    return response.legacyProjects[0]?.v1ProjectId ?? null;
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
    chainIds,
  }: {
    address: string;
    alloVersion: AlloVersion;
    chainIds: number[];
  }): Promise<v2Project[]> {
    const requestVariables = {
      address: address.toLowerCase(),
      version: alloVersion,
      chainIds,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectsAndRolesByAddress,
      requestVariables,
    );

    const projects: v2Project[] = mergeCanonicalAndLinkedProjects(
      response.projects,
    );

    return projects;
  }

  /**
   * getApplicationsByProjectIds() returns a list of projects by address.
   * @param projectIds
   * @param chainIds
   */
  async getApplicationsByProjectIds({
    projectIds,
    chainIds,
  }: {
    projectIds: string[];
    chainIds: number[];
  }): Promise<ProjectApplicationWithRound[]> {
    const requestVariables = {
      projectIds: projectIds,
      chainIds: chainIds,
    };

    const response: { applications: ProjectApplicationWithRound[] } =
      await request(
        this.gsIndexerEndpoint,
        getApplicationsByProjectIds,
        requestVariables,
      );

    return response.applications ?? [];
  }

  /**
   * Returns a single application as identified by its id, round name and chain name
   * @param projectId
   */
  async getApplication({
    roundId,
    chainId,
    applicationId,
  }: {
    roundId: Lowercase<Address> | string;
    chainId: number;
    applicationId: string;
  }): Promise<Application | undefined> {
    const requestVariables = {
      roundId,
      chainId,
      applicationId,
    };

    const response: { application: Application } = await request(
      this.gsIndexerEndpoint,
      getApplication,
      requestVariables,
    );

    return response.application ?? [];
  }

  /**
   * Returns a single application as identified by its id, round name and chain name
   * @param projectId
   */
  async getApplicationsByRoundIdAndProjectIds({
    chainId,
    roundId,
    projectIds,
  }: {
    chainId: number;
    roundId: string;
    projectIds: string[];
  }): Promise<ProjectApplicationWithRound[]> {
    const requestVariables = {
      chainId,
      roundId,
      projectIds,
    };

    const response: { applications: ProjectApplicationWithRound[] } =
      await request(
        this.gsIndexerEndpoint,
        getApplicationsByRoundIdAndProjectIds,
        requestVariables,
      );

    return response.applications ?? [];
  }

  async getRoundByIdAndChainId({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<V2RoundWithProject> {
    const requestVariables = {
      roundId,
      chainId,
    };

    const response: { rounds: V2RoundWithProject[] } = await request(
      this.gsIndexerEndpoint,
      getRoundByIdAndChainId,
      requestVariables,
    );

    return response.rounds[0] ?? [];
  }

  async getRoundForManager({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<RoundForManager | null> {
    const requestVariables = {
      roundId,
      chainId,
    };

    const response: { rounds: RoundForManager[] } = await request(
      this.gsIndexerEndpoint,
      getRoundForManager,
      requestVariables,
    );

    return response.rounds[0] ?? null;
  }

  async getRoundsForManager(args: {
    chainId: number;
    programId: string;
  }): Promise<RoundForManager[]> {
    const response: { rounds: RoundForManager[] } = await request(
      this.gsIndexerEndpoint,
      getRoundsForManager,
      args,
    );

    return response.rounds;
  }

  async getRoundByIdAndChainIdWithApprovedApplications({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<{ round: Round } | null> {
    const requestVariables = {
      roundId,
      chainId,
    };

    const response: { rounds: RoundWithApplications[] } = await request(
      this.gsIndexerEndpoint,
      getRoundByIdAndChainIdWithApprovedApplications,
      requestVariables,
    );

    if (response.rounds.length === 0) {
      return null;
    }

    const _round = response.rounds[0] ?? [];

    const projects: Project[] = _round.applications
      .map((application: Application) => {
        if (application.project === null) {
          console.error(`Project not found for application ${application.id}`);
          return null;
        }

        return {
          grantApplicationId: application.id,
          projectRegistryId: application.projectId,
          anchorAddress: application.project.anchorAddress,
          recipient: application.metadata.application.recipient,
          projectMetadata: {
            title: application.project.metadata.title,
            description: application.project.metadata.description,
            website: application.project.metadata.website,
            logoImg: application.project.metadata.logoImg,
            bannerImg: application.project.metadata.bannerImg,
            projectTwitter: application.project.metadata.projectTwitter,
            userGithub: application.project.metadata.userGithub,
            projectGithub: application.project.metadata.projectGithub,
            credentials: application.project.metadata.credentials,
            owners: application.project.metadata.owners,
            createdAt: application.project.metadata.createdAt,
            lastUpdated: application.project.metadata.lastUpdated,
          },
          grantApplicationFormAnswers:
            application.metadata.application.answers.map(
              (answer: GrantApplicationFormAnswer) => ({
                questionId: answer.questionId,
                question: answer.question,
                answer: answer.answer,
                hidden: answer.hidden,
                type: answer.type,
              }),
            ),
          status: application.status as ApplicationStatus,
          applicationIndex: Number(application.id),
        };
      })
      .filter((p) => p !== null) as Project[];

    return {
      round: {
        id: _round.id,
        chainId: _round.chainId,
        applicationsStartTime: new Date(_round.applicationsStartTime),
        applicationsEndTime: new Date(_round.applicationsEndTime),
        roundStartTime: new Date(_round.donationsStartTime),
        roundEndTime: new Date(_round.donationsEndTime),
        token: _round.matchTokenAddress,
        ownedBy: _round.ownedBy,
        roundMetadata: _round.roundMetadata,
        payoutStrategy: {
          id: _round.strategyAddress,
          strategyName: _round.strategyName,
        },
        approvedProjects: projects,
      },
    };
  }

  async getApplicationsForManager(args: {
    chainId: number;
    roundId: string;
  }): Promise<ProjectApplicationForManager[]> {
    const response: { applications: ProjectApplicationForManager[] } =
      await request(this.gsIndexerEndpoint, getApplicationsForManager, args);

    return response.applications;
  }

  async getDonationsByDonorAddress(args: {
    address: Address;
    chainIds: number[];
  }): Promise<Contribution[]> {
    const { address, chainIds } = args;
    const response: { donations: Contribution[] } = await request(
      this.gsIndexerEndpoint,
      getDonationsByDonorAddress,
      {
        address: address.toLowerCase(),
        chainIds,
      },
    );

    return response.donations;
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

  async getRounds({
    chainIds,
    first,
    orderBy,
    filter,
  }: {
    chainIds: number[];
    first: number;
    orderBy?: OrderByRounds;
    orderDirection?: "asc" | "desc";
    filter?: RoundsQueryVariables["filter"];
  }): Promise<{ rounds: RoundGetRound[] }> {
    return await request(this.gsIndexerEndpoint, getRoundsQuery, {
      orderBy: orderBy ?? "NATURAL",
      chainIds,
      first,
      filter,
    });
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
