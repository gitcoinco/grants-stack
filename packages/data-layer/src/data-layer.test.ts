import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import { getAddress } from "viem";
import { describe, expect, test, vi } from "vitest";
import { v2Project } from ".";
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
  },
];

const mockProject = mockProjects[0];

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

describe("passport verification", () => {
  test("invokes passport verifier", async () => {
    const mockPassportVerifier = {
      verifyCredential: vi.fn().mockResolvedValue(true),
    } as unknown as PassportVerifier;

    const dataLayer = new DataLayer({
      search: { baseUrl: "https://example.com" },
      subgraph: { endpointsByChainId: {} },
      passport: { verifier: mockPassportVerifier },
      indexer: { baseUrl: "https://example.com" },
    });

    const { isVerified } = await dataLayer.verifyPassportCredential({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      credentialSubject: {
        id: "did:pkh:eip155:1:subject",
      },
    } as VerifiableCredential);

    expect(isVerified).toBe(true);
    expect(mockPassportVerifier.verifyCredential).toBeCalledWith({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      credentialSubject: {
        id: "did:pkh:eip155:1:subject",
      },
    });
  });
});

describe("projects retrieval", () => {
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
      chainId: 11155111,
      alloVersion: "allo-v2",
    });

    // todo: update to test the entire object when the missing fields are added
    // to the indexer. @0xKurt
    // {
    //   bannerImg: "",
    //   bannerImgData: new Blob(),
    //   logoImg: "",
    //   logoImgData: new Blob(),
    // }
    expect(project?.project.id).toEqual(mockProject.id);
    expect(project?.project.nodeId).toEqual(mockProject.nodeId);
    expect(project?.project.chainId).toEqual(mockProject.chainId);
    expect(project?.project.registryAddress).toEqual(mockProject.registryAddress);
    expect(project?.project.projectNumber).toEqual(mockProject.projectNumber);
    expect(project?.project.tags).toEqual(mockProject.tags);
    expect(project?.project.roles).toEqual(mockProject.roles);
    expect(project?.project.name).toEqual(mockProject.name);
    expect(project?.project.metadata.description).toEqual(mockProject.metadata.description);
  });

  test("can retrieve all projects for a network", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        projects: mockProjects,
      }),
    });

    const dataLayer = new DataLayer({
      fetch: fetchMock,
      search: { baseUrl: "https://example.com" },
      subgraph: { endpointsByChainId: {} },
      indexer: { baseUrl: "https://indexer-staging.fly.dev/graphql" },
    });

    const data = await dataLayer.getProjects({
      chainIds: [5],
      first: 10,
      alloVersion: "allo-v2",
    });

    if (data?.projects) expect(data.projects.length).toBeGreaterThan(0);
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
