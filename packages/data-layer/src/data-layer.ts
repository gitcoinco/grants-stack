import _fetch from "cross-fetch";
import { request } from "graphql-request";
import shuffle from "knuth-shuffle-seeded";
import { Address, getAddress } from "viem";
import * as categories from "./backends/categories";
import * as collections from "./backends/collections";
import { AlloVersion, PaginationInfo } from "./data-layer.types";
import { gql } from "graphql-request";
import {
  Application,
  Collection,
  OrderByRounds,
  Program,
  Project,
  ProjectApplicationForManager,
  ProjectApplicationWithRound,
  Round,
  RoundGetRound,
  RoundsQueryVariables,
  SearchBasedProjectCategory,
  V2RoundWithProject,
  v2Project,
  RoundForManager,
  Contribution,
  RoundForExplorer,
  ExpandedApplicationRef,
  RoundApplicationPayout,
  ProjectApplicationWithRoundAndProgram,
  DirectDonationValues,
} from "./data.types";
import {
  ApplicationSummary,
  DefaultApi as SearchApi,
  Configuration as SearchApiConfiguration,
  SearchResult,
} from "./openapi-search-client/index";
import {
  getApprovedApplication,
  getApplicationsByProjectIds,
  getApplicationsByRoundIdAndProjectIds,
  getApplicationsForManager,
  getLegacyProjectId,
  getProgramById,
  getProgramsByUserAndTag,
  getProjectsById,
  getProjectAnchorByIdAndChainId,
  getProjectsAndRolesByAddress,
  getRoundByIdAndChainId,
  getRoundForManager,
  getRoundsForManager,
  getRoundForExplorer,
  getRoundsQuery,
  getDonationsByDonorAddress,
  getApplicationsForExplorer,
  getPayoutsByChainIdRoundIdProjectId,
  getApprovedApplicationsByProjectIds,
  getPaginatedProjects,
  getProjectsBySearchTerm,
  getRoundsForManagerByAddress,
  getDirectDonationsByProjectId,
} from "./queries";
import { mergeCanonicalAndLinkedProjects, orderByMapping } from "./utils";
import {
  AttestationService,
  type MintingAttestationIdsData,
} from "./services/AttestationService";

/**
 * DataLayer is a class that provides a unified interface to the various data sources.
 *
 * @remarks
 *
 * @public
 *
 * @param fetch - The fetch implementation to use for making HTTP requests.
 * @param search - The configuration for the search API.
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
  private ipfsGateway: string;
  private collectionsSource: collections.CollectionsSource;
  private gsIndexerEndpoint: string;

  private attestationService: AttestationService;

  constructor({
    fetch,
    search,
    indexer,
    ipfs,
    collections,
  }: {
    fetch?: typeof _fetch;
    search: {
      pagination?: { pageSize: number };
      baseUrl: string;
    };
    indexer: {
      baseUrl: string;
    };
    // TODO reflect that we specifically require Pinata?
    ipfs?: {
      gateway: string;
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
    this.ipfsGateway = ipfs?.gateway ?? "https://ipfs.io";
    this.collectionsSource =
      collections?.googleSheetsUrl === undefined
        ? { type: "hardcoded" }
        : { type: "google-sheet", url: collections.googleSheetsUrl };
    this.gsIndexerEndpoint = indexer.baseUrl;

    this.attestationService = new AttestationService(this.gsIndexerEndpoint);
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
    chainIds,
    tags,
  }: {
    address: string;
    chainIds: number[];
    tags: string[];
  }): Promise<{ programs: Program[] }> {
    const requestVariables = {
      userAddress: getAddress(address),
      chainIds,
      tags: ["program", ...tags],
    };

    const response: { projects: Program[] } = await request(
      this.gsIndexerEndpoint,
      getProgramsByUserAndTag,
      requestVariables,
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
      getProjectsById,
      requestVariables,
    );

    if (response.projects.length === 0) return null;

    const project = mergeCanonicalAndLinkedProjects(response.projects)[0];

    return { project: project };
  }

  async getProjectAnchorByIdAndChainId({
    projectId,
    chainId,
  }: {
    projectId: string;
    chainId: number;
  }): Promise<Address | undefined> {
    const response: { projects: Array<{ anchorAddress: Address }> } =
      await request(this.gsIndexerEndpoint, getProjectAnchorByIdAndChainId, {
        projectId,
        chainId,
      });

    return response?.projects[0]?.anchorAddress;
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
      address: getAddress(address),
      version: alloVersion,
      chainIds,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectsAndRolesByAddress,
      requestVariables,
    );

    const mergedProjects = mergeCanonicalAndLinkedProjects(response.projects);
    return mergedProjects;
  }

  /**
   * Gets all active projects in the given range.
   * @param first // number of projects to return
   * @param offset // number of projects to skip
   *
   * @returns v2Project[]
   */
  async getPaginatedProjects({
    first,
    offset,
    chainIds,
  }: {
    first: number;
    offset: number;
    chainIds: number[];
  }): Promise<v2Project[]> {
    const requestVariables = {
      first,
      offset,
      chainIds,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getPaginatedProjects,
      requestVariables,
    );

    return response.projects;
  }

  /**
   * Gets all projects that match the search term.
   * @param searchTerm // search term to filter projects
   * @param first // number of projects to return
   * @param offset // number of projects to skip
   *
   * @returns v2Project[]
   */
  async getProjectsBySearchTerm({
    searchTerm,
    first,
    offset,
    chainIds,
  }: {
    searchTerm: string;
    first: number;
    offset: number;
    chainIds: number[];
  }): Promise<v2Project[]> {
    const requestVariables = {
      searchTerm: `(?i)`.concat(searchTerm.replace(/^['"]|['"]$/g, "")),
      first,
      offset,
      chainIds,
    };

    const response: { projects: v2Project[] } = await request(
      this.gsIndexerEndpoint,
      getProjectsBySearchTerm,
      requestVariables,
    );

    return response.projects;
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
   * getApprovedApplicationsByProjectIds() returns a list of approved applications of given projects.
   * @param projectIds
   */
  async getApprovedApplicationsByProjectIds({
    projectIds,
  }: {
    projectIds: string[];
  }): Promise<ProjectApplicationWithRoundAndProgram[]> {
    const requestVariables = {
      projectIds: projectIds,
    };

    const response: { applications: ProjectApplicationWithRoundAndProgram[] } =
      await request(
        this.gsIndexerEndpoint,
        getApprovedApplicationsByProjectIds,
        requestVariables,
      );

    return response.applications ?? [];
  }

  /**
   * Returns a single application as identified by its id, round name and chain name
   * @param projectId
   */
  async getApprovedApplication({
    roundId,
    chainId,
    applicationId,
  }: {
    roundId: Lowercase<Address> | string;
    chainId: number;
    applicationId: string;
  }): Promise<Application | null> {
    const requestVariables = {
      roundId,
      chainId,
      applicationId,
    };

    const response: { applications: Application[] } = await request(
      this.gsIndexerEndpoint,
      getApprovedApplication,
      requestVariables,
    );

    if (response.applications.length === 0) {
      return null;
    }

    const application = response.applications[0];
    application.project.metadata = application.metadata.application.project;

    return application;
  }

  async getApplicationsForExplorer({
    roundId,
    chainId,
  }: {
    roundId: string;
    chainId: number;
  }): Promise<Application[]> {
    const requestVariables = {
      roundId,
      chainId,
    };

    const response: { applications: Application[] } = await request(
      this.gsIndexerEndpoint,
      getApplicationsForExplorer,
      requestVariables,
    );

    return (
      response.applications.map((application) => {
        application.project.metadata = application.metadata.application.project;
        return application;
      }) ?? []
    );
  }

  /**
   * Returns a list of applications identified by their chainId, roundId, and id.
   * @param expandedRefs
   */
  async getApprovedApplicationsByExpandedRefs(
    expandedRefs: Array<ExpandedApplicationRef>,
  ): Promise<ApplicationSummary[]> {
    if (expandedRefs.length === 0) {
      return [];
    }

    const applicationToFilter = (r: ExpandedApplicationRef): string => {
      return `{
        _and: {
          chainId: { _eq: ${r.chainId} }
          roundId: {
            _eq: "${r.roundId}"
          }
          id: { _eq: "${r.id}" }
        }
      }`;
    };

    const filters = expandedRefs.map(applicationToFilter).join("\n");

    const query = gql`
      query Application {
        applications(
          limit: 300
          where: {
            _and: [
              { status: { _eq: APPROVED } },
              { _or: [ ${filters} ] }
            ]
          }
        ) {
          id
          anchorAddress
          chainId
          roundId
          projectId
          status
          totalAmountDonatedInUsd
          uniqueDonorsCount
          round {
            strategyName
            donationsStartTime
            donationsEndTime
            applicationsStartTime
            applicationsEndTime
            matchTokenAddress
            roundMetadata
            tags
          }
          metadata
          project {
            tags
            id
            anchorAddress
          }
        }
      }
    `;

    const response: { applications: Application[] } = await request(
      this.gsIndexerEndpoint,
      query,
    );

    return response.applications.map((a: Application) => {
      const projectMetadata = a.metadata.application.project;
      return {
        applicationRef: `${a.chainId}:${a.roundId}:${a.id}`,
        chainId: parseInt(a.chainId),
        roundApplicationId: a.id,
        roundId: a.roundId,
        roundName: a.round.roundMetadata?.name,
        projectId: a.project.id,
        name: projectMetadata?.title,
        websiteUrl: projectMetadata?.website,
        logoImageCid: projectMetadata?.logoImg ?? null,
        bannerImageCid: projectMetadata?.bannerImg ?? null,
        summaryText: projectMetadata?.description,
        payoutWalletAddress: a.metadata?.application?.recipient,
        createdAtBlock: 123,
        contributorCount: a.uniqueDonorsCount,
        contributionsTotalUsd: a.totalAmountDonatedInUsd,
        tags: a.round.tags,
        anchorAddress: a.anchorAddress,
      };
    });
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

  async getRoundsForManagersByAddress({
    address,
    chainIds,
  }: {
    address: string;
    chainIds: number[];
  }): Promise<RoundForManager[]> {
    const response: { rounds: RoundForManager[] } = await request(
      this.gsIndexerEndpoint,
      getRoundsForManagerByAddress,
      { chainIds, address: getAddress(address) },
    );

    return response.rounds;
  }

  async getRoundForExplorer({
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

    const response: { rounds: RoundForExplorer[] } = await request(
      this.gsIndexerEndpoint,
      getRoundForExplorer,
      requestVariables,
    );

    if (response.rounds.length === 0) {
      return null;
    }

    const round = response.rounds[0];

    const projects: Project[] = round.applications.flatMap((application) => {
      if (application.project === null) {
        // eslint-disable-next-line no-console
        console.error(`Project not found for application ${application.id}`);
        return [];
      }

      return [
        {
          grantApplicationId: application.id,
          projectRegistryId: application.projectId,
          anchorAddress: application.anchorAddress,
          recipient: application.metadata.application.recipient,
          projectMetadata: {
            title: application.metadata.application.project.title,
            description: application.metadata.application.project.description,
            website: application.metadata.application.project.website,
            logoImg: application.metadata.application.project.logoImg,
            bannerImg: application.metadata.application.project.bannerImg,
            projectTwitter:
              application.metadata.application.project.projectTwitter,
            userGithub: application.metadata.application.project.userGithub,
            projectGithub:
              application.metadata.application.project.projectGithub,
            credentials: application.metadata.application.project.credentials,
            owners: application.metadata.application.project.owners,
            createdAt: application.metadata.application.project.createdAt,
            lastUpdated: application.metadata.application.project.lastUpdated,
          },
          grantApplicationFormAnswers:
            application.metadata.application.answers.map((answer) => ({
              questionId: answer.questionId,
              question: answer.question,
              answer: answer.answer,
              hidden: answer.hidden,
              type: answer.type,
            })),
          status: application.status,
          applicationIndex: Number(application.id),
        },
      ];
    });

    return {
      round: {
        id: round.id,
        chainId: round.chainId,
        applicationsStartTime: new Date(round.applicationsStartTime),
        applicationsEndTime: new Date(round.applicationsEndTime),
        roundStartTime: new Date(round.donationsStartTime),
        roundEndTime: new Date(round.donationsEndTime),
        token: round.matchTokenAddress,
        ownedBy: round.ownedBy,
        roundMetadata: round.roundMetadata,
        payoutStrategy: {
          id: round.strategyAddress,
          strategyName: round.strategyName,
        },
        applicationQuestions:
          round.applicationMetadata?.applicationSchema?.questions,
        approvedProjects: projects,
        uniqueDonorsCount: round.uniqueDonorsCount,
      },
    };
  }

  async getApplicationsForManager(args: {
    chainId: number;
    roundId: string;
  }): Promise<ProjectApplicationForManager[]> {
    const PAGE_SIZE = 200; // You can adjust this value based on your needs
    let allApplications: ProjectApplicationForManager[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response: { applications: ProjectApplicationForManager[] } =
        await request(this.gsIndexerEndpoint, getApplicationsForManager, {
          ...args,
          limit: PAGE_SIZE,
          offset,
        });

      const applications = response.applications;
      allApplications = [...allApplications, ...applications];

      // If we got fewer results than the page size, we've reached the end
      if (applications.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        offset += PAGE_SIZE;
      }
    }

    return allApplications;
  }

  async getDonationsByDonorAddress(args: {
    address: Address;
    chainIds: number[];
  }): Promise<Contribution[]> {
    const { address, chainIds } = args;
    let offset = 0;
    let hasMore = true;
    const limit = 200;
    let donations: Contribution[] = [];

    while (hasMore) {
      const response: { donations: Contribution[] } = await request(
        this.gsIndexerEndpoint,
        getDonationsByDonorAddress,
        { address: getAddress(address), chainIds, limit, offset },
      );

      donations = [...donations, ...response.donations];

      // Check if we need to fetch more
      if (response.donations.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    // Filter out invalid donations and map the project metadata from application metadata (solution for canonical projects in indexer v2)
    const validDonations = donations.reduce<Contribution[]>(
      (validDonations, donation) => {
        if (donation.round.strategyName !== "allov2.DirectAllocationStrategy") {
          if (donation.application?.project) {
            donation.application.project.metadata =
              donation.application.metadata.application.project;

            validDonations.push(donation);
          }
        } else {
          if (donation.application === null) {
            validDonations.push(donation);
          }
        }
        return validDonations;
      },
      [],
    );

    return validDonations;
  }

  async getPayoutsByChainIdRoundIdProjectId(args: {
    chainId: number;
    roundId: string;
    projectId: string;
  }): Promise<RoundApplicationPayout> {
    const response: { rounds: RoundApplicationPayout[] } = await request(
      this.gsIndexerEndpoint,
      getPayoutsByChainIdRoundIdProjectId,
      args,
    );

    return response.rounds[0];
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
        }
      | {
          type: "expanded-refs";
          refs: ExpandedApplicationRef[];
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
    whitelistedPrograms,
  }: {
    chainIds: number[];
    first: number;
    orderBy?: OrderByRounds;
    orderDirection?: "asc" | "desc";
    filter?: RoundsQueryVariables["filter"];
    whitelistedPrograms?: string[];
    query?: string | undefined;
  }): Promise<{ rounds: RoundGetRound[] }> {
    return await request(this.gsIndexerEndpoint, getRoundsQuery, {
      first,
      orderBy: orderByMapping[orderBy ?? "NATURAL"],
      filter: whitelistedPrograms
        ? {
            ...filter,
            projectId: { _in: whitelistedPrograms },
            chainId: { _in: chainIds },
          }
        : filter,
    });
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

  async getDirectDonationsByProjectId({
    projectId,
    chainIds,
  }: {
    projectId: string;
    chainIds: number[];
  }): Promise<DirectDonationValues[]> {
    const response: { rounds: { donations: DirectDonationValues[] }[] } =
      await request(this.gsIndexerEndpoint, getDirectDonationsByProjectId, {
        projectId,
        chainIds,
      });

    // Flatten the donations from all rounds into a single array
    const allDonations = response.rounds.flatMap((round) => round.donations);

    return allDonations;
  }

  async getMintingAttestationIdsByTransactionHash({
    transactionHashes,
  }: {
    transactionHashes: string[];
  }): Promise<MintingAttestationIdsData[]> {
    return this.attestationService.getMintingAttestationIdsByTransactionHash({
      transactionHashes,
    });
  }

  async getAttestationCount({
    attestationChainIds,
  }: {
    attestationChainIds: number[];
  }): Promise<number> {
    return this.attestationService.getAttestationCount({ attestationChainIds });
  }
}
