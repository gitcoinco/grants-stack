import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { saveToIPFS } from "../../../features/api/ipfs";
import { updateDistributionToContract } from "../../../features/api/payoutStrategy/payoutStrategy";
import { ProgressStatus } from "../../../features/api/types";
import { makeMatchingStatsData } from "../../../test-utils";
import {
  FinalizeRoundProvider,
  useFinalizeRound,
} from "../FinalizeRoundContext";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};
jest.mock("../../../features/api/payoutStrategy/payoutStrategy");
jest.mock("../../../features/api/round");
jest.mock("../../../features/api/ipfs");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("<FinalizeRoundProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useFinalizeRound()", () => {
    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (saveToIPFS as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseFinalizeRoundComponent />);

      const finalizeRound = screen.getByTestId("finalize-round");
      fireEvent.click(finalizeRound);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets ipfs status to complete when saving to ipfs succeeds", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");
      (updateDistributionToContract as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseFinalizeRoundComponent />);

      const finalizeRound = screen.getByTestId("finalize-round");
      fireEvent.click(finalizeRound);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets contract deployment status to success when contract has been deployed", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("bafabcdef");
      (updateDistributionToContract as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestUseFinalizeRoundComponent />);

      const createContract = screen.getByTestId("finalize-round");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `deploying-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("useFinalizeRound() Errors", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
        /* do nothing.*/
      });
    });

    afterEach(() => {
      consoleErrorSpy.mockClear();
    });

    it("sets ipfs status to error when ipfs save fails", async () => {
      (saveToIPFS as jest.Mock).mockRejectedValue(new Error(":("));

      renderWithProvider(<TestUseFinalizeRoundComponent />);
      const finalizeRound = screen.getByTestId("finalize-round");
      fireEvent.click(finalizeRound);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets contract deployment status to error when deployment fails", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("asdf");
      (updateDistributionToContract as jest.Mock).mockRejectedValue(
        new Error("Failed to deploy :(")
      );

      renderWithProvider(<TestUseFinalizeRoundComponent />);
      const finalizeRound = screen.getByTestId("finalize-round");
      fireEvent.click(finalizeRound);

      expect(
        await screen.findByTestId(
          `deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("if ipfs save fails, resets ipfs status when create round is retried", async () => {
      (saveToIPFS as jest.Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseFinalizeRoundComponent />);
      fireEvent.click(screen.getByTestId("finalize-round"));

      await screen.findByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`);

      // retry finalize-round operation
      fireEvent.click(screen.getByTestId("finalize-round"));

      expect(
        screen.queryByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });
  });
});

const TestUseFinalizeRoundComponent = () => {
  const { finalizeRound, IPFSCurrentStatus, finalizeRoundToContractStatus } =
    useFinalizeRound();

  const roundId = faker.finance.ethereumAddress();
  const matchingData = [makeMatchingStatsData(), makeMatchingStatsData()];

  return (
    <div>
      <button
        onClick={() => finalizeRound(roundId, matchingData)}
        data-testid="finalize-round"
      >
        Finalize Round
      </button>

      <div data-testid={`storing-status-is-${IPFSCurrentStatus}`} />

      <div
        data-testid={`deploying-status-is-${finalizeRoundToContractStatus}`}
      />
    </div>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<FinalizeRoundProvider>{ui}</FinalizeRoundProvider>);
}
