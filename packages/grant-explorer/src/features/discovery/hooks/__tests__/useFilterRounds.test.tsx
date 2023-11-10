import { renderHook, waitFor } from "@testing-library/react";
import { useFilterRounds } from "../useFilterRounds";
import sleep from "sleep-promise";
import { makeRoundOverviewData } from "../../../../test-utils";
import {
  cleanRoundData,
  filterRounds,
  filterRoundsWithProjects,
  sortRounds,
} from "../../../api/rounds";

vi.mock("node-fetch");
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return {
    ...actual,
    useSearchParams: () => [],
  };
});
vi.mock("swr", async () => {
  const actual = await vi.importActual<typeof import("swr")>("swr");
  return {
    ...actual,
    useSWRConfig: () => {
      return {
        mutate: () => {},
        cache: { get: (key: string) => ({ data: { roundType: "public" } }) },
      };
    },
  };
});
const fetchMock = vi.fn();
global.fetch = fetchMock;

function createFetchResponse(data: unknown) {
  return {
    ok: true,
    json: async () => Promise.resolve({ data: { rounds: data } }),
  };
}
const MOCKED_ROUNDS = 5;
describe("useFilterRounds", () => {
  const mockedRounds = Array.from({ length: MOCKED_ROUNDS }).map(() =>
    makeRoundOverviewData()
  );
  const defaultFilter = {
    orderBy: "",
    orderDirection: "",
    status: "",
    network: "",
    type: "",
  } as const;

  it("hook returns data", async () => {
    fetchMock.mockResolvedValue(createFetchResponse(mockedRounds));

    const { result } = renderHook(() => useFilterRounds(defaultFilter));

    await waitFor(() => sleep(100));

    expect(result?.current.data?.length).toBe(MOCKED_ROUNDS * 7);
  });
  it("filterRoundsWithProjects", async () => {
    expect(filterRoundsWithProjects([mockedRounds[0]]).length).toBe(1);
    expect(
      // Filter out empty projects
      filterRoundsWithProjects([
        {
          ...mockedRounds[0],
          // Only if end time is before now
          applicationsEndTime: "0",
          projects: [],
        },
      ]).length
    ).toBe(0);
    expect(
      filterRoundsWithProjects([
        {
          ...mockedRounds[0],
          projects: [],
        },
      ]).length
    ).toBe(1);
  });
  it("sortRounds", async () => {
    const sortedAsc = sortRounds(
      [{ matchAmount: "10" } as any, { matchAmount: "1" }],
      {
        ...defaultFilter,
        orderBy: "matchAmount",
        orderDirection: "asc",
      }
    );
    expect(sortedAsc[0].matchAmount).toEqual("1");
    expect(sortedAsc[1].matchAmount).toEqual("10");

    const sortedDesc = sortRounds(
      [{ matchAmount: "10" } as any, { matchAmount: "1" }],
      {
        ...defaultFilter,
        orderBy: "matchAmount",
        orderDirection: "desc",
      }
    );
    expect(sortedDesc[0].matchAmount).toEqual("10");
    expect(sortedDesc[1].matchAmount).toEqual("1");
  });
  it("cleanRoundData", async () => {
    expect(
      // Fix milliseconds to seconds
      cleanRoundData([
        {
          ...mockedRounds[0],
          // Multiply by 1000 and check that it's still the value in seconds
          roundStartTime: String(+mockedRounds[0].roundStartTime * 1000),
        },
      ])[0].roundStartTime
    ).toBe(mockedRounds[0].roundStartTime);
    expect(
      // Fix overflowed timestamp
      cleanRoundData([
        {
          ...mockedRounds[0],
          // Multiply by 1000 and check that it's still the value in seconds
          roundStartTime:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        },
      ])[0].roundStartTime
    ).toBe(undefined);
  });
  it("filterRounds", async () => {
    const createCacheMock = (data: unknown) => ({
      get: () => ({ data }),
    });
    const cacheMock = createCacheMock({ roundType: "private" }) as any;
    // Only show public rounds
    expect(
      filterRounds(
        createCacheMock({ roundType: "public" }) as any,
        mockedRounds
      )?.length
    ).toBe(5);
    expect(filterRounds(cacheMock, mockedRounds)?.length).toBe(0);

    expect(
      filterRounds(
        cacheMock,
        mockedRounds.map((r) => ({
          ...r,
          // If RoundID is part of valid rounds
          id: "0x35c9d05558da3a3f3cddbf34a8e364e59b857004",
        }))
      )?.length
    ).toBe(5);
    expect(
      filterRounds(
        cacheMock,
        mockedRounds.map((r) => ({
          ...r,
          // If RoundID is part of invalid rounds
          id: "0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef",
        }))
      )?.length
    ).toBe(0);
  });
});
