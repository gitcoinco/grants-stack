/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoundProvider, useRoundById } from "../RoundContext";
import { render, screen } from "@testing-library/react";
import { makeRoundData } from "../../../test-utils";
import { getRoundById } from "../../../features/api/round";
import { ProgressStatus, Round } from "../../../features/api/types";

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
  signer: {
    getChainId: () => {},
  },
};

describe("<RoundProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useRoundById()", () => {
    it("sets fetch round status to in progress when fetch is in progress", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId: string = expectedRound.id!;
      (getRoundById as any).mockReturnValue(new Promise<Round>(() => {}));

      render(
        <RoundProvider>
          <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
        </RoundProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets round based on given round id when fetch succeeds", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId: string = expectedRound.id!;
      (getRoundById as any).mockResolvedValue(expectedRound);

      render(
        <RoundProvider>
          <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
        </RoundProvider>
      );

      expect(
        await screen.findByTestId(
          `fetch-round-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();

      expect(await screen.findByText(expectedRoundId)).toBeInTheDocument();
    });

    it("sets fetch round status to error when fetch fails", async () => {
      const expectedRound = makeRoundData();
      const expectedRoundId: string = expectedRound.id!;
      (getRoundById as any).mockRejectedValue(new Error(":("));

      render(
        <RoundProvider>
          <TestingUseRoundByIdComponent expectedRoundId={expectedRoundId} />
        </RoundProvider>
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
