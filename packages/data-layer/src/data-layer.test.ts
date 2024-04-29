import { getAddress } from "viem";
import { describe, expect, test, vi } from "vitest";
import {
  ProjectApplicationMetadata,
  ProjectApplicationWithRound,
  v2Project,
} from ".";
import { DataLayer } from "./data-layer";

// This is mocked from an acutal project on Sepolia
const mockProjects: v2Project[] = [
  {
    id: "0x8a79249b63395c25bd121ba6ff280198c399d4fb3f951fc3c42197b54a6db6a6",
    chainId: 11155111,
    metadata: {
      protocol: 1,
      pointer: "QmS9XiFsCq2Ng6buJmBLvNWNpcsHs4uYBhVmBfSK2DFpsm",
      id: "0x8a79249b63395c25bd121ba6ff280198c399d4fb3f951fc3c42197b54a6db6a6",
      title: "Jax v2 test 4",
      logoImg: "",
      website: "https://test.com",
      bannerImg: "",
      createdAt: 1706114867213,
      credentials: {},
      description:
        "Sint laborum minus debitis nulla nesciunt perferendis officia delectus. Explicabo saepe similique excepturi dolores architecto. Nesciunt perspiciatis praesentium porro facere aliquam voluptate quasi iusto.",
      logoImgData: new Blob(),
      bannerImgData: new Blob(),
      userGithub: "",
      projectGithub: "",
      projectTwitter: "",
    },
    metadataCid: "bafkreie4ra5mdxumvxhsjpvawhvtdovlgjk4v74zsgvpqrs2ehdk5srtl4",
    name: "Jax v2 test 4",
    nodeId:
      "WyJwcm9qZWN0cyIsIjB4OGE3OTI0OWI2MzM5NWMyNWJkMTIxYmE2ZmYyODAxOThjMzk5ZDRmYjNmOTUxZmMzYzQyMTk3YjU0YTZkYjZhNiIsMTExNTUxMTFd",
    // note: This is moved to roles also
    createdByAddress: "0x0000",
    createdAtBlock: "5146499",
    updatedAtBlock: "5146499",
    projectNumber: null,
    registryAddress: "0x4aacca72145e1df2aec137e1f3c5e3d75db8b5f3",
    tags: ["allo-v2"],
    roles: [
      {
        address: "0xe849b2a694184b8739a04c915518330757cdb18b",
        role: "OWNER",
        createdAtBlock: "5146499",
      },
    ],
    projectType: "CANONICAL",
    linkedChains: [],
  },
];
const mockProject = mockProjects[0];
const mockApplications: ProjectApplicationWithRound[] = [
  {
    id: "1",
    projectId:
      "0x8a79249b63395c25bd121ba6ff280198c399d4fb3f951fc3c42197b54a6db6a6",
    chainId: 11155111,
    roundId: "28",
    status: "PENDING",
    metadataCid: "",
    metadata: {} as ProjectApplicationMetadata,
    totalDonationsCount: 0,
    totalAmountDonatedInUsd: 0,
    uniqueDonorsCount: 0,
    distributionTransaction: null,
    anchorAddress: getAddress("0xe849b2a694184b8739a04c915518330757cdb133"),
    round: {
      strategyName: "allov1.QF",
      applicationsStartTime: "2024-02-20T17:27:40+00:00",
      applicationsEndTime: "2024-02-27T17:24:40+00:00",
      donationsStartTime: "2024-02-20T18:54:40+00:00",
      donationsEndTime: "2024-03-05T17:24:40+00:00",
      roundMetadata: {
        name: "Test Round 1",
        roundType: "public",
        eligibility: {
          description:
            'The goal in 2024 is to scale Zuzalu and create an open vibrant ecosystem, with multiple independent spinoffs that innovate on the original idea. We can carry the torch of Zuzalu 2023, with the experience, learnings and culture from these early days, and bring it to the next level by working with and welcoming top talent from our broader world. This round’s primary objective is to fund spinoff events, referred to as "Zu-events." This initiative is expected to significantly contribute to the fulfillment of Zuzalu\'s mission in the year 2024. A “Zuzalu event” is a long-duration in-person gathering whose goal is to experiment with open frontier digital and social technologies.',
          requirements: [{ requirement: "You should be awesome" }],
        },
        programContractAddress: "",
        support: {
          info: "",
          type: "email",
        },
      },
      name: "Test Round 1",
    },
  },
];

describe("applications search", () => {
  describe("can retrieve multiple applications by search query", () => {
    test("reports data and metadata", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          results: [
            {
              meta: { searchType: "fulltext" },
              data: { applicationRef: "1:0x123:0", name: "project #0" },
            },
            {
              meta: { searchType: "semantic" },
              data: { applicationRef: "1:0x123:1", name: "project #1" },
            },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com" },
        indexer: { baseUrl: "https://example.com" },
      });

      const { results } = await dataLayer.searchApplications({
        queryString: "open source",
        page: 0,
      });

      expect(results).toEqual([
        {
          meta: { searchType: "fulltext" },
          data: { applicationRef: "1:0x123:0", name: "project #0" },
        },
        {
          meta: { searchType: "semantic" },
          data: { applicationRef: "1:0x123:1", name: "project #1" },
        },
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/search?q=open%20source",
        { method: "GET", headers: {} },
      );
    });

    test("paginates results", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          results: [
            {
              meta: { searchType: "fulltext" },
              data: { applicationRef: "1:0x123:0", name: "project #0" },
            },
            {
              meta: { searchType: "semantic" },
              data: { applicationRef: "1:0x123:1", name: "project #1" },
            },
            {
              meta: { searchType: "semantic" },
              data: { applicationRef: "1:0x123:2", name: "project #2" },
            },
            {
              meta: { searchType: "semantic" },
              data: { applicationRef: "1:0x123:3", name: "project #3" },
            },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });

      const { results, pagination } = await dataLayer.searchApplications({
        queryString: "open source",
        page: 0,
      });

      expect(pagination).toEqual({
        totalItems: 4,
        totalPages: 2,
        currentPage: 0,
      });
      expect(results).toEqual([
        {
          meta: { searchType: "fulltext" },
          data: { applicationRef: "1:0x123:0", name: "project #0" },
        },
        {
          meta: { searchType: "semantic" },
          data: { applicationRef: "1:0x123:1", name: "project #1" },
        },
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/search?q=open%20source",
        { method: "GET", headers: {} },
      );
    });
  });

  describe("can retrieve paginated applications", () => {
    test("returns pagination data along with application data", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            { applicationRef: "1:0x123:0", name: "project #0" },
            { applicationRef: "1:0x123:1", name: "project #1" },
            { applicationRef: "1:0x123:2", name: "project #2" },
            { applicationRef: "1:0x123:3", name: "project #3" },
            { applicationRef: "1:0x123:4", name: "project #4" },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });
      const { applications, pagination } =
        await dataLayer.getApplicationsPaginated({
          page: 0,
        });

      expect(pagination).toEqual({
        totalItems: 5,
        totalPages: 3,
        currentPage: 0,
      });
      expect(applications).toEqual([
        { applicationRef: "1:0x123:0", name: "project #0" },
        { applicationRef: "1:0x123:1", name: "project #1" },
      ]);
    });

    test("handles last page having fewer items than page size", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            { applicationRef: "1:0x123:0", name: "project #0" },
            { applicationRef: "1:0x123:1", name: "project #1" },
            { applicationRef: "1:0x123:2", name: "project #2" },
            { applicationRef: "1:0x123:3", name: "project #3" },
            { applicationRef: "1:0x123:4", name: "project #4" },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });
      const { applications, pagination } =
        await dataLayer.getApplicationsPaginated({
          page: 2,
        });

      expect(pagination).toEqual({
        totalItems: 5,
        totalPages: 3,
        currentPage: 2,
      });
      expect(applications).toEqual([
        { applicationRef: "1:0x123:4", name: "project #4" },
      ]);
    });

    test("returns an empty array if page is beyond last", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            { applicationRef: "1:0x123:0", name: "project #0" },
            { applicationRef: "1:0x123:1", name: "project #1" },
            { applicationRef: "1:0x123:2", name: "project #2" },
            { applicationRef: "1:0x123:3", name: "project #3" },
            { applicationRef: "1:0x123:4", name: "project #4" },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });
      const { applications, pagination } =
        await dataLayer.getApplicationsPaginated({
          page: 10,
        });

      expect(pagination).toEqual({
        totalItems: 5,
        totalPages: 3,
        currentPage: 10,
      });
      expect(applications).toEqual([]);
    });

    test("can shuffle items based on seed", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            { applicationRef: "1:0x123:0", name: "project #0" },
            { applicationRef: "1:0x123:1", name: "project #1" },
            { applicationRef: "1:0x123:2", name: "project #2" },
            { applicationRef: "1:0x123:3", name: "project #3" },
            { applicationRef: "1:0x123:4", name: "project #4" },
            { applicationRef: "1:0x123:5", name: "project #5" },
            { applicationRef: "1:0x123:6", name: "project #6" },
            { applicationRef: "1:0x123:7", name: "project #7" },
            { applicationRef: "1:0x123:7", name: "project #8" },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });

      for (let i = 0; i < 10; i++) {
        const { applications, pagination } =
          await dataLayer.getApplicationsPaginated({
            page: 0,
            order: { type: "random", seed: 42 },
          });

        expect(pagination).toEqual({
          totalItems: 9,
          totalPages: 5,
          currentPage: 0,
        });
        expect(applications).toEqual([
          { applicationRef: "1:0x123:5", name: "project #5" },
          { applicationRef: "1:0x123:7", name: "project #8" },
        ]);
      }
    });

    test("can sort by block creation number", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            {
              applicationRef: "1:0x123:0",
              name: "project #0",
              createdAtBlock: 100,
            },
            {
              applicationRef: "1:0x123:1",
              name: "project #1",
              createdAtBlock: 1,
            },
            {
              applicationRef: "1:0x123:2",
              name: "project #2",
              createdAtBlock: 50,
            },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });

      for (let i = 0; i < 10; i++) {
        const { applications, pagination } =
          await dataLayer.getApplicationsPaginated({
            page: 0,
            order: { type: "createdAtBlock", direction: "asc" },
          });

        expect(pagination).toEqual({
          totalItems: 3,
          totalPages: 2,
          currentPage: 0,
        });
        expect(applications).toEqual([
          {
            applicationRef: "1:0x123:1",
            name: "project #1",
            createdAtBlock: 1,
          },
          {
            applicationRef: "1:0x123:2",
            name: "project #2",
            createdAtBlock: 50,
          },
        ]);
      }
    });

    test("can sort by contributor count", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            {
              applicationRef: "1:0x123:0",
              name: "project #0",
              contributorCount: 100,
            },
            {
              applicationRef: "1:0x123:1",
              name: "project #1",
              contributorCount: 1,
            },
            {
              applicationRef: "1:0x123:2",
              name: "project #2",
              contributorCount: 50,
            },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });

      const { applications, pagination } =
        await dataLayer.getApplicationsPaginated({
          page: 0,
          order: { type: "contributorCount", direction: "asc" },
        });

      expect(pagination).toEqual({
        totalItems: 3,
        totalPages: 2,
        currentPage: 0,
      });
      expect(applications).toEqual([
        {
          applicationRef: "1:0x123:1",
          name: "project #1",
          contributorCount: 1,
        },
        {
          applicationRef: "1:0x123:2",
          name: "project #2",
          contributorCount: 50,
        },
      ]);
    });

    test("can filter by chain", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            {
              applicationRef: "1:0x123:0",
              name: "project #0",
              chainId: 1,
            },
            {
              applicationRef: "1:0x123:1",
              name: "project #1",
              chainId: 42,
            },
            {
              applicationRef: "1:0x123:2",
              name: "project #2",
              chainId: 1,
            },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com", pagination: { pageSize: 2 } },
        indexer: { baseUrl: "https://example.com" },
      });

      const { applications, pagination } =
        await dataLayer.getApplicationsPaginated({
          page: 0,
          filter: { type: "chains", chainIds: [1] },
        });

      expect(pagination).toEqual({
        totalItems: 2,
        totalPages: 1,
        currentPage: 0,
      });

      expect(applications).toEqual([
        {
          applicationRef: "1:0x123:0",
          name: "project #0",
          chainId: 1,
        },
        {
          applicationRef: "1:0x123:2",
          name: "project #2",
          chainId: 1,
        },
      ]);
    });

    test("can filter by refs", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          applicationSummaries: [
            { applicationRef: "1:0x123:0", name: "project #0" },
            { applicationRef: "1:0x123:1", name: "project #1" },
            { applicationRef: "1:0x123:2", name: "project #2" },
          ],
        }),
      });

      const dataLayer = new DataLayer({
        fetch: fetchMock,
        search: { baseUrl: "https://example.com" },
        indexer: { baseUrl: "https://example.com" },
      });
      const { applications } = await dataLayer.getApplicationsPaginated({
        page: 0,
        filter: {
          type: "refs",
          refs: ["1:0x123:0", "1:0x123:2"],
        },
      });

      expect(applications).toEqual([
        { applicationRef: "1:0x123:0", name: "project #0" },
        { applicationRef: "1:0x123:2", name: "project #2" },
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/applications",
        {
          method: "GET",
          headers: {},
        },
      );
    });
  });
});

describe("v2 projects retrieval", () => {
  test("can retrieve project by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        project: mockProject,
      }),
    });

    const dataLayer = new DataLayer({
      fetch: fetchMock,
      search: { baseUrl: "https://example.com" },
      subgraph: { endpointsByChainId: {} },
      indexer: { baseUrl: "https://indexer-staging.fly.dev/graphql" },
    });

    const project = await dataLayer.getProjectById({
      projectId:
        "0x8a79249b63395c25bd121ba6ff280198c399d4fb3f951fc3c42197b54a6db6a6",
      alloVersion: "allo-v2",
    });

    expect(project?.project.id).toEqual(mockProject.id);
    expect(project?.project.nodeId).toEqual(mockProject.nodeId);
    expect(project?.project.chainId).toEqual(mockProject.chainId);
    expect(project?.project.registryAddress).toEqual(
      mockProject.registryAddress,
    );
    // Note: projectNumber is depreciated in v2 and should be null
    expect(project?.project.projectNumber).toEqual(null);
    expect(project?.project.tags).toEqual(mockProject.tags);
    expect(project?.project.roles).toEqual(mockProject.roles);
    expect(project?.project.name).toEqual(mockProject.name);
    expect(project?.project.metadata.description).toEqual(
      mockProject.metadata.description,
    );
  });

  test("can retrieve multiple projects by address", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        project: mockProjects,
      }),
    });

    const dataLayer = new DataLayer({
      fetch: fetchMock,
      search: { baseUrl: "https://example.com" },
      subgraph: { endpointsByChainId: {} },
      indexer: { baseUrl: "https://indexer-staging.fly.dev/graphql" },
    });

    const projects = await dataLayer.getProjectsByAddress({
      address: "0xe849b2a694184b8739a04c915518330757cdb18b",
      alloVersion: "allo-v2",
      chainIds: [11155111],
    });

    expect(projects[0].id).toEqual(mockProject.id);
    expect(projects[0].chainId).toEqual(mockProject.chainId);
    expect(projects[0].registryAddress).toEqual(mockProject.registryAddress);
    // Note: projectNumber is depreciated in v2 and should be null
    expect(projects[0].projectNumber).toEqual(null);
    expect(projects[0].tags).toEqual(mockProject.tags);
    expect(projects[0].name).toEqual(mockProject.name);
    expect(projects[0].metadata.description).toEqual(
      mockProject.metadata.description,
    );
  });

  test("can get applications by project id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        applications: mockApplications,
      }),
    });

    const dataLayer = new DataLayer({
      fetch: fetchMock,
      search: { baseUrl: "https://example.com" },
      subgraph: { endpointsByChainId: {} },
      indexer: { baseUrl: "https://indexer-staging.fly.dev/graphql" },
    });

    const applications = await dataLayer.getApplicationsByProjectIds({
      projectIds: [
        "0x8a79249b63395c25bd121ba6ff280198c399d4fb3f951fc3c42197b54a6db6a6",
      ],
      chainIds: [11155111],
    });

    expect(applications[0].id).toEqual(mockApplications[0].id);
    expect(applications[0].chainId).toEqual(mockApplications[0].chainId);
    expect(applications[0].projectId).toEqual(mockApplications[0].projectId);
    expect(applications[0].status).toEqual(mockApplications[0].status);
    expect(applications[0].round.applicationsStartTime).toEqual(
      mockApplications[0].round.applicationsStartTime,
    );
    expect(applications[0].round.applicationsEndTime).toEqual(
      mockApplications[0].round.applicationsEndTime,
    );
    expect(applications[0].round.donationsStartTime).toEqual(
      mockApplications[0].round.donationsStartTime,
    );
    expect(applications[0].round.donationsEndTime).toEqual(
      mockApplications[0].round.donationsEndTime,
    );
  });
});

describe("categories", () => {
  test("can be retrieved collectively", async () => {
    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      indexer: { baseUrl: "https://example.com" },
    });

    const categories = await dataLayer.getSearchBasedCategories();

    expect(categories[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      images: expect.any(Array),
      searchQuery: expect.any(String),
    });
    expect(categories).toHaveLength(4);
  });

  test("can be retrieved individually", async () => {
    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      indexer: { baseUrl: "https://example.com" },
    });

    const category = await dataLayer.getSearchBasedCategoryById("open-source");

    expect(category).toMatchObject({
      id: "open-source",
      name: "Open source",
      images: [
        "/assets/categories/category_01.jpg",
        "/assets/categories/category_02.jpg",
        "/assets/categories/category_03.jpg",
        "/assets/categories/category_04.jpg",
      ],
      searchQuery: "open source, open source software",
    });
  });
});

describe("collections", () => {
  test("can be retrieved collectively", async () => {
    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      indexer: { baseUrl: "https://example.com" },
    });

    const collections = await dataLayer.getProjectCollections();

    expect(collections[0]).toMatchObject({
      id: expect.any(String),
      author: expect.any(String),
      images: expect.any(Array),
      description: expect.any(String),
      applicationRefs: expect.any(Array),
    });
    expect(collections).toHaveLength(12);
  });

  test("can be retrieved individually", async () => {
    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      indexer: { baseUrl: "https://example.com" },
    });

    const collection = await dataLayer.getProjectCollectionById(
      "first-time-grantees",
    );

    expect(collection).toMatchObject({
      id: "first-time-grantees",
      author: "Gitcoin",
      name: "First Time Grantees",
      images: [
        // TODO: make into absolute URLs
        "/assets/collections/collection_01.jpg",
        "/assets/collections/collection_02.jpg",
        "/assets/collections/collection_03.jpg",
        "/assets/collections/collection_04.jpg",
      ],
      description:
        "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
      applicationRefs: expect.any(Array),
    });
  });

  test("ensures that the address component of the application ref is in checksummed format", async () => {
    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      indexer: { baseUrl: "https://example.com" },
    });

    const collections = await dataLayer.getProjectCollections();
    for (const collection of collections) {
      for (const applicationRef of collection.applicationRefs) {
        const address = applicationRef.split(":")[1];
        expect(address).toEqual(getAddress(address));
      }
    }
  });
});
