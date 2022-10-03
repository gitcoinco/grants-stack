import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import {
  BulkUpdateGrantApplicationParams,
  BulkUpdateGrantApplicationProvider,
  useBulkUpdateGrantApplication,
} from "../BulkUpdateGrantApplicationContext";
// import { saveToIPFS } from "../../../features/api/ipfs";
import {
  updateRoundContract,
  updateApplicationList,
} from "../../../features/api/application";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";

// jest.mock("../../../features/api/ipfs");
jest.mock("../../../features/api/application");
jest.mock("../../../features/api/subgraph");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {},
  },
};

describe("<BulkUpdateGrantApplicationProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useBulkUpdateGrantApplication", () => {
    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (updateApplicationList as jest.Mock).mockReturnValue(
        new Promise<any>(() => {})
      );
      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      fireEvent.click(screen.getByTestId("update-grant-application"));

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets ipfs status to complete when saving to ipfs succeeds", async () => {
      (updateApplicationList as jest.Mock).mockResolvedValue("some hash");
      (updateRoundContract as jest.Mock).mockReturnValue(
        new Promise<any>(() => {})
      );
      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      fireEvent.click(screen.getByTestId("update-grant-application"));

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    it("sets contract update status to in progress when contract is being updated", async () => {
      (updateApplicationList as jest.Mock).mockResolvedValue("some hash");
      (updateRoundContract as jest.Mock).mockReturnValue(
        new Promise<any>(() => {})
      );

      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      fireEvent.click(screen.getByTestId("update-grant-application"));

      expect(
        await screen.findByTestId(
          `contract-updating-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets update status to complete when updating contract succeeds", async () => {
      (updateApplicationList as jest.Mock).mockResolvedValue("some hash");
      (updateRoundContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: 100,
      });
      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      fireEvent.click(screen.getByTestId("update-grant-application"));

      expect(
        await screen.findByTestId(
          `contract-updating-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    it("sets indexing status to in progress when waiting for subgraph to index", async () => {
      const transactionBlockNumber = 10;
      (updateApplicationList as jest.Mock).mockResolvedValue("bafabcdef");
      (updateRoundContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise<any>(() => {})
      );

      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      const createContract = screen.getByTestId("update-grant-application");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets indexing status to completed when subgraph is finished indexing", async () => {
      const transactionBlockNumber = 10;
      (updateApplicationList as jest.Mock).mockResolvedValue("bafabcdef");
      (updateRoundContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      const createContract = screen.getByTestId("update-grant-application");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    describe("useBulkUpdateGrantApplication Errors", () => {
      let consoleErrorSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
      });

      afterEach(() => {
        consoleErrorSpy.mockClear();
      });

      it("sets ipfs status to error when ipfs save fails", async () => {
        (updateApplicationList as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

        fireEvent.click(screen.getByTestId("update-grant-application"));

        expect(
          await screen.findByTestId(
            `storing-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).toBeInTheDocument();
      });

      it("sets contract updating status to error when updating contract fails", async () => {
        (updateRoundContract as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

        fireEvent.click(screen.getByTestId("update-grant-application"));

        expect(
          await screen.findByTestId(
            `contract-updating-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).toBeInTheDocument();
      });

      it("sets indexing status to error when waiting for subgraph to sync fails", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("asdf");
        (updateRoundContract as jest.Mock).mockResolvedValue({
          transactionBlockNumber: 100,
        });
        (waitForSubgraphSyncTo as jest.Mock).mockRejectedValue(new Error(":("));

        renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);
        fireEvent.click(screen.getByTestId("update-grant-application"));

        expect(
          await screen.findByTestId(
            `indexing-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).toBeInTheDocument();
      });
    });
  });
});

const TestUseBulkUpdateGrantApplicationComponent = () => {
  const {
    bulkUpdateGrantApplication,
    IPFSCurrentStatus,
    contractUpdatingStatus,
    indexingStatus,
  } = useBulkUpdateGrantApplication();

  return (
    <div>
      <button
        onClick={() => {
          bulkUpdateGrantApplication({} as BulkUpdateGrantApplicationParams);
        }}
        data-testid="update-grant-application"
      >
        Bulk Update Grant Applications
      </button>

      <div data-testid={`storing-status-is-${IPFSCurrentStatus}`} />

      <div
        data-testid={`contract-updating-status-is-${contractUpdatingStatus}`}
      />

      <div data-testid={`indexing-status-is-${indexingStatus}`} />
    </div>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(
    <BulkUpdateGrantApplicationProvider>
      {ui}
    </BulkUpdateGrantApplicationProvider>
  );
}
