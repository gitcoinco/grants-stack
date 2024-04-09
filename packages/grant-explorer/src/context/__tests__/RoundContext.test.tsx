/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRoundById, RoundProvider } from "../RoundContext";
import { render, screen, waitFor } from "@testing-library/react";
import { makeRoundData } from "../../test-utils";
import { DataLayer, DataLayerProvider } from "data-layer";
import { Mocked } from "vitest";

vi.mock("../../features/api/round");
/*TODO: look into wagmi MockConnector*/
vi.mock("wagmi");

describe("<ListRoundProvider />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("useRoundById()", () => {
    it("provides round based on given round id", async () => {
      const expectedRound = makeRoundData({
        chainId: 5,
      });
      const expectedRoundId: string = expectedRound.id!;

      const dataLayerMock = {
        getRoundForExplorer: vi.fn().mockResolvedValue({
          round: expectedRound,
        }),
      } as unknown as Mocked<DataLayer>;

      render(
        <DataLayerProvider client={dataLayerMock}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(await screen.findByText(expectedRoundId)).toBeInTheDocument();
    });

    it("sets isLoading to true when getRoundById call is in progress", async () => {
      const expectedRound = makeRoundData({
        chainId: 5,
      });
      const expectedRoundId: string = expectedRound.id!;

      const dataLayerMock = {
        getRoundForExplorer: vi.fn().mockResolvedValue({
          round: expectedRound,
        }),
      } as unknown as Mocked<DataLayer>;

      render(
        <DataLayerProvider client={dataLayerMock}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId("is-loading-round-by-id")
      ).toBeInTheDocument();
    });

    it("sets isLoading back to false and when getRoundById call succeeds", async () => {
      const expectedRound = makeRoundData({
        chainId: 5,
      });
      const expectedRoundId: string = expectedRound.id!;

      const dataLayerMock = {
        getRoundForExplorer: vi.fn().mockResolvedValue({
          round: expectedRound,
        }),
      } as unknown as Mocked<DataLayer>;

      render(
        <DataLayerProvider client={dataLayerMock}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-round-by-id")
        ).not.toBeInTheDocument();
      });
    });

    it("sets isLoading back to false when getRoundById call fails", async () => {
      const expectedRound = makeRoundData({
        chainId: 5,
      });
      const expectedRoundId: string = expectedRound.id!;

      const dataLayerMock = {
        getRoundForExplorer: vi.fn().mockRejectedValue(new Error()),
      } as unknown as Mocked<DataLayer>;

      render(
        <DataLayerProvider client={dataLayerMock}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-round-by-id")
        ).not.toBeInTheDocument();
      });

      screen.getByTestId("round-by-id-error-msg");
    });
  });
});

const TestingUseRoundByIdComponent = (props: { expectedRoundId: string }) => {
  const { round, isLoading, getRoundByIdError } = useRoundById(
    5,
    props.expectedRoundId
  );
  return (
    <>
      {round ? <div>{round.id}</div> : <div>No Round Found</div>}

      {isLoading && <div data-testid="is-loading-round-by-id"></div>}

      {getRoundByIdError && <div data-testid="round-by-id-error-msg" />}
    </>
  );
};
