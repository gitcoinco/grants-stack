import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  signPermit2612,
  voteUsingMRCContract,
} from "../../features/api/voting";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { ProgressStatus } from "../../features/api/types";
import { getPayoutTokenOptions } from "../../features/api/utils";
import {
  QFDonationParams,
  QFDonationProvider,
  useQFDonation,
} from "../QFDonationContext";
import { BigNumber } from "ethers";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      return 1;
    },
  },
};

jest.mock("../../features/api/application");
jest.mock("../../features/api/subgraph");
jest.mock("../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi", () => ({
  useSigner: () => mockWallet.signer,
}));

const roundId = faker.finance.ethereumAddress();
const donationToken = getPayoutTokenOptions(5)[0];
const totalDonation = BigNumber.from(10);

describe("<QFDonationProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useQFDonation", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("sets token approval status to in progress when user is signing token approval", async () => {
      (signPermit2612 as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(
          `token-approval-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets token approval status to completed when user has signed token approval", async () => {
      (signPermit2612 as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });

      (voteUsingMRCContract as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(
          `token-approval-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    it("sets vote to in progress when user is invoking vote", async () => {
      (signPermit2612 as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });

      (voteUsingMRCContract as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(
          `vote-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets vote to completed when user has signed vote transaction", async () => {
      (signPermit2612 as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (voteUsingMRCContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(`vote-status-is-${ProgressStatus.IS_SUCCESS}`)
      );
    });

    it("sets indexing status to in progress when waiting for subgraph to index", async () => {
      (signPermit2612 as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (voteUsingMRCContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );
      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets indexing status to completed when for subgraph has finished indexing", async () => {
      (signPermit2612 as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (voteUsingMRCContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: faker.random.numeric(),
      });
      (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestUseQFDonationComponent />);

      fireEvent.click(screen.getByTestId("submit-qf-donations"));

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    describe("useQFDonation Errors", () => {
      let consoleErrorSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {
            /* do nothing.*/
          });
      });

      afterEach(() => {
        consoleErrorSpy.mockClear();
      });

      it("sets token approval status to error when token approval fails", async () => {
        (signPermit2612 as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseQFDonationComponent />);

        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          await screen.findByTestId(
            `token-approval-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).toBeInTheDocument();
      });

      it("sets vote status to error when invoking vote fails", async () => {
        (signPermit2612 as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (voteUsingMRCContract as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseQFDonationComponent />);

        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          await screen.findByTestId(`vote-status-is-${ProgressStatus.IS_ERROR}`)
        ).toBeInTheDocument();
      });

      it("sets indexing status to error when indexing fails", async () => {
        (signPermit2612 as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (voteUsingMRCContract as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (waitForSubgraphSyncTo as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseQFDonationComponent />);

        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          await screen.findByTestId(
            `indexing-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).toBeInTheDocument();
      });

      it("if token approval fails, resets token approval status when submit qf donation is retried", async () => {
        (signPermit2612 as jest.Mock)
          .mockRejectedValueOnce(new Error(":("))
          .mockReturnValue(
            new Promise(() => {
              /* do nothing.*/
            })
          );

        renderWithProvider(<TestUseQFDonationComponent />);
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        // retry bulk update operation
        await screen.findByTestId(
          `token-approval-status-is-${ProgressStatus.IS_ERROR}`
        );
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          screen.queryByTestId(
            `token-approval-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).not.toBeInTheDocument();
      });

      it("if vote fails, resets vote status when submit qf donation is retried", async () => {
        (signPermit2612 as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (voteUsingMRCContract as jest.Mock)
          .mockRejectedValueOnce(new Error(":("))
          .mockReturnValue(
            new Promise(() => {
              /* do nothing.*/
            })
          );

        renderWithProvider(<TestUseQFDonationComponent />);
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        // retry bulk update operation
        await screen.findByTestId(`vote-status-is-${ProgressStatus.IS_ERROR}`);
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          screen.queryByTestId(`vote-status-is-${ProgressStatus.IS_ERROR}`)
        ).not.toBeInTheDocument();
      });

      it("if indexing fails, resets indexing status when submit qf donation is retried", async () => {
        (signPermit2612 as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (voteUsingMRCContract as jest.Mock).mockResolvedValue({
          transactionBlockNumber: faker.random.numeric(),
        });
        (waitForSubgraphSyncTo as jest.Mock)
          .mockRejectedValueOnce(new Error(":("))
          .mockReturnValue(
            new Promise(() => {
              /* do nothing.*/
            })
          );

        renderWithProvider(<TestUseQFDonationComponent />);
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        // retry bulk update operation
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_ERROR}`
        );
        fireEvent.click(screen.getByTestId("submit-qf-donations"));

        expect(
          screen.queryByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`)
        ).not.toBeInTheDocument();
      });
    });
  });
});

const TestUseQFDonationComponent = () => {
  const { submitDonations, tokenApprovalStatus, voteStatus, indexingStatus } =
    useQFDonation();

  return (
    <div>
      <button
        onClick={() => {
          submitDonations({
            roundId: roundId,
            donations: [],
            donationToken: donationToken,
            totalDonation: totalDonation,
            votingStrategy: faker.finance.ethereumAddress(),
          } as QFDonationParams);
        }}
        data-testid="submit-qf-donations"
      >
        Submit QF Donations
      </button>

      <div data-testid={`token-approval-status-is-${tokenApprovalStatus}`} />

      <div data-testid={`vote-status-is-${voteStatus}`} />

      <div data-testid={`indexing-status-is-${indexingStatus}`} />
    </div>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<QFDonationProvider>{ui}</QFDonationProvider>);
}
