/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoundProvider, useRoundById, useRounds } from "../RoundContext";
import { render, screen } from "@testing-library/react";
import { makeRoundData } from "../../../test-utils";
import { getRoundById, listRounds } from "../../../features/api/round";
import { ProgressStatus, Round } from "../../../features/api/types";
import { DataLayer, DataLayerProvider } from "data-layer";

jest.mock("../../../features/api/round");
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));

const mockWallet = {
  address: "0x0",
  provider: { getNetwork: () => Promise.resolve({ chainId: "0" }) },
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

describe("<RoundProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useRounds()", () => {
    const TestingUseRoundsComponent = (props: {
      expectedProgramId: string;
    }) => {
      const { data, fetchRoundStatus, error } = useRounds(
        props.expectedProgramId
      );
      return (
        <>
          <div>
            {data.map((round, index) => (
              <div data-testid="round" key={index}>
                {round.id}
              </div>
            ))}
          </div>

          <div data-testid={`fetch-round-status-is-${fetchRoundStatus}`}></div>

          {error && <div data-testid="use-round-error-msg" />}
        </>
      );
    };

    it("sets fetch round status to in progress when fetch is in progress", async () => {
      const expectedRound = makeRoundData();
      const expectedProgramId = expectedRound.id;
      (listRounds as jest.Mock).mockReturnValue(
        new Promise<Round>(() => {
          /* do nothing.*/
        })
      );

      render(
        <DataLayerProvider client={{} as DataLayer}>
          <RoundProvider>
            <TestingUseRoundsComponent expectedProgramId={expectedProgramId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets list of round data when fetch succeeds", async () => {
      const expectedRoundList = [
        makeRoundData(),
        makeRoundData(),
        makeRoundData(),
      ];
      const expectedProgramId = expectedRoundList[0].ownedBy;
      (listRounds as jest.Mock).mockResolvedValue({
        rounds: expectedRoundList,
      });

      render(
        <DataLayerProvider client={{} as DataLayer}>
          <RoundProvider>
            <TestingUseRoundsComponent expectedProgramId={expectedProgramId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();

      expect(screen.queryAllByTestId("round")).toHaveLength(
        expectedRoundList.length
      );
      expectedRoundList.forEach((expectedRound) => {
        expect(screen.getByText(expectedRound.id!)).toBeInTheDocument();
      });
    });

    it("sets fetch round status to error when fetch fails", async () => {
      const expectedRound = makeRoundData();
      const expectedProgramId = expectedRound.ownedBy;

      const dataLayerMock = {
        getRoundsByProgramIdAndChainId: jest
          .fn()
          .mockRejectedValue(new Error(":(")),
      } as unknown as DataLayer;

      render(
        <DataLayerProvider client={dataLayerMock}>
          <RoundProvider>
            <TestingUseRoundsComponent expectedProgramId={expectedProgramId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();

      expect(
        await screen.findByTestId("use-round-error-msg")
      ).toBeInTheDocument();
    });
  });

  describe("useRoundById()", () => {
    it("sets fetch round status to in progress when fetch is in progress", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId = expectedRound.id;
      (getRoundById as any).mockReturnValue(
        new Promise<Round>(() => {
          /* do nothing.*/
        })
      );

      render(
        <DataLayerProvider client={{} as DataLayer}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets round based on given round id when fetch succeeds", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId = expectedRound.id;
      (getRoundById as any).mockResolvedValue(expectedRound);

      render(
        <DataLayerProvider client={{} as DataLayer}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();

      expect(await screen.findByText(expectedRoundId!)).toBeInTheDocument();
    });

    it("sets fetch round status to error when fetch fails", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId = expectedRound.id;
      (getRoundById as any).mockRejectedValue(new Error(":("));

      render(
        <DataLayerProvider client={{} as DataLayer}>
          <RoundProvider>
            <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
          </RoundProvider>
        </DataLayerProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();

      expect(
        await screen.findByTestId("round-by-id-error-msg")
      ).toBeInTheDocument();
    });
  });
});

const TestingUseRoundByIdComponent = (props: { expectedRoundId: string }) => {
  const { round, fetchRoundStatus, error } = useRoundById(
    props.expectedRoundId
  );
  return (
    <>
      {round ? <div>{round.id}</div> : <div>No Round Found</div>}

      <div data-testid={`fetch-round-status-is-${fetchRoundStatus}`}></div>

      {error && <div data-testid="round-by-id-error-msg" />}
    </>
  );
};
