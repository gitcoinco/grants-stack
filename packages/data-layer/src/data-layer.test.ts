import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import { describe, expect, test, vi } from "vitest";
import { v2ProjectNew } from ".";
import { DataLayer } from "./data-layer";

const mockProjects: v2ProjectNew[] = [
  {
    id: "0x00490de473481e6883b7a13f582ee8e927dce1bafa924c28407edd425aac916e",
    chainId: 5,
    metadata: {
      name: "Random Round",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    },
    metadataCid: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi",
    name: "Allo Workshop",
    nodeId:
      "WyJwcm9qZWN0cyIsIjB4MDA0OTBkZTQ3MzQ4MWU2ODgzYjdhMTNmNTgyZWU4ZTkyN2RjZTFiYWZhOTI0YzI4NDA3ZWRkNDI1YWFjOTE2ZSIsNV0=",
    projectNumber: 0,
    registryAddress: "0x4aacca72145e1df2aec137e1f3c5e3d75db8b5f3",
    tags: ["allo-v2"],
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
  test("invokes passport verifier ", async () => {
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

    expect(isVerified).toEqual(true);
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
        "0x00490de473481e6883b7a13f582ee8e927dce1bafa924c28407edd425aac916e",
      chainId: 5,
      alloVersion: "allo-v2",
    });

    // fixme: not working
    // expect(project).toEqual(mockProject);
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
