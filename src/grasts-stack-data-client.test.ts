import { describe, test, expect, vi } from "vitest";
import { GrantsStackDataClient } from "./grants-stack-data-client.js";

describe("data client", () => {
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
      });

      const { results } = await client.query({
        type: "applications-search",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });

      const { results, pagination } = await client.query({
        type: "applications-search",
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

  test("can retrieve multiple applications by refs", async () => {
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

    const client = new GrantsStackDataClient({
      fetch: fetchMock,
      baseUrl: "https://example.com",
    });
    const { applications } = await client.query({
      type: "applications-by-refs",
      refs: ["1:0x123:0", "1:0x123:2"],
    });

    expect(applications).toEqual([
      { applicationRef: "1:0x123:0", name: "project #0" },
      { applicationRef: "1:0x123:2", name: "project #2" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/applications", {
      method: "GET",
      headers: {},
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });
      const { applications, pagination } = await client.query({
        type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });
      const { applications, pagination } = await client.query({
        type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });
      const { applications, pagination } = await client.query({
        type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });

      for (let i = 0; i < 10; i++) {
        const { applications, pagination } = await client.query({
          type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });

      for (let i = 0; i < 10; i++) {
        const { applications, pagination } = await client.query({
          type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });

      const { applications, pagination } = await client.query({
        type: "applications-paginated",
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

      const client = new GrantsStackDataClient({
        fetch: fetchMock,
        baseUrl: "https://example.com",
        pagination: { pageSize: 2 },
      });

      const { applications, pagination } = await client.query({
        type: "applications-paginated",
        page: 0,
        filter: { type: "chain", chainId: 1 },
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
  });
});
