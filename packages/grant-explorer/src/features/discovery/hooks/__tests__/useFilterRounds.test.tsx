import { renderHook, waitFor } from "@testing-library/react";
import { useFilterRounds } from "../useFilterRounds";
import {
  makeRoundMetadata,
  makeRoundOverviewData,
} from "../../../../test-utils";
import {
  filterOutPrivateRounds,
  filterRoundsWithProjects,
} from "../../../api/rounds";
import { DataLayer, DataLayerProvider } from "data-layer";
import { getEnabledChains } from "../../../../app/chainConfig";

vi.mock("node-fetch");
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams()],
  };
});
vi.mock("swr", async () => {
  const actual = await vi.importActual<typeof import("swr")>("swr");
  return {
    ...actual,
    useSWRConfig: () => {
      return {
        mutate: () => {},
        cache: { get: () => ({ data: { roundType: "public" } }) },
      };
    },
  };
});

describe("useFilterRounds", () => {
  const MOCKED_ROUNDS = Array.from({ length: 5 }).map(() =>
    makeRoundOverviewData({
      roundMetadata: {
        ...makeRoundMetadata(),
        roundType: "private",
      },
    })
  );

  const DEFAULT_FILTER = {
    orderBy: "NATURAL",
    status: "",
    network: "",
    type: "",
  } as const;

  it("hook returns data", async () => {
    const chains = getEnabledChains();
    const mockedRoundsOverAllChains = chains.flatMap((chain) =>
      MOCKED_ROUNDS.map((round) => ({ ...round, chainId: chain.id }))
    );

    const mockDataLayer = {
      getRounds: vi.fn().mockResolvedValueOnce({
        rounds: mockedRoundsOverAllChains,
      }),
    } as unknown as DataLayer;

    const { result } = renderHook(
      () => useFilterRounds(DEFAULT_FILTER, chains),
      {
        wrapper: ({ children }) => (
          <DataLayerProvider client={mockDataLayer}>
            {children}
          </DataLayerProvider>
        ),
      }
    );

    await waitFor(() =>
      expect(result?.current.data?.length).toBe(
        mockedRoundsOverAllChains.length
      )
    );
  });

  it("filterRoundsWithProjects", async () => {
    expect(filterRoundsWithProjects([MOCKED_ROUNDS[0]]).length).toBe(1);
    expect(
      // Filter out empty projects
      filterRoundsWithProjects([
        {
          ...MOCKED_ROUNDS[0],
          // Only if end time is before now
          applicationsEndTime: new Date(0).toISOString(),
          applications: [],
        },
      ]).length
    ).toBe(0);
    expect(
      filterRoundsWithProjects([
        {
          ...MOCKED_ROUNDS[0],
          applications: [],
        },
      ]).length
    ).toBe(0);
  });

  it("filterRounds", async () => {
    // Only show public rounds
    expect(filterOutPrivateRounds(MOCKED_ROUNDS)?.length).toBe(0);
  });
});
