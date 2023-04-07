import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import {
  BulkUpdateGrantApplicationParams,
  BulkUpdateGrantApplicationProvider,
  useBulkUpdateGrantApplications,
} from "../BulkUpdateGrantApplicationContext";
import {
  updateApplicationStatuses,
  updateApplicationList,
} from "../../../features/api/application";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";
import { faker } from "@faker-js/faker";

jest.mock("../../../features/api/application");
jest.mock("../../../features/api/subgraph");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

describe("<BulkUpdateGrantApplicationProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useBulkUpdateGrantApplication", () => {
    it.only("sets contract update status to in progress when contract is being updated", async () => {
      (updateApplicationList as jest.Mock).mockResolvedValue("some hash");
      (updateApplicationStatuses as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);

      fireEvent.click(screen.getByTestId("update-grant-application"));

      expect(
        await screen.findByTestId(
          `contract-updating-status-is-${ProgressStatus.IN_PROGRESS}}`
        )
      );
    });

    it("sets update status to complete when updating contract succeeds", async () => {
      (updateApplicationList as jest.Mock).mockResolvedValue("some hash");
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
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
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
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
      const transactionBlockNumber = faker.datatype.number();
      (updateApplicationList as jest.Mock).mockResolvedValue("bafabcdef");
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
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
          .mockImplementation(() => {
            /* do nothing.*/
          });
      });

      afterEach(() => {
        consoleErrorSpy.mockClear();
      });

      it("sets contract updating status to error when updating contract fails", async () => {
        (updateApplicationStatuses as jest.Mock).mockRejectedValue(
          new Error(":(")
        );

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
        (updateApplicationStatuses as jest.Mock).mockResolvedValue({
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

      it("if contract update fails, resets contract updating status when bulk update is retried", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("asdf");
        (updateApplicationStatuses as jest.Mock)
          .mockRejectedValueOnce(new Error(":("))
          .mockReturnValue(
            new Promise(() => {
              /* do nothing.*/
            })
          );

        renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);
        fireEvent.click(screen.getByTestId("update-grant-application"));

        // retry bulk update operation
        await screen.findByTestId(
          `contract-updating-status-is-${ProgressStatus.IS_ERROR}`
        );
        fireEvent.click(screen.getByTestId("update-grant-application"));

        expect(
          screen.queryByTestId(
            `contract-updating-status-is-${ProgressStatus.IS_ERROR}`
          )
        ).not.toBeInTheDocument();
      });

      it("if indexing fails, resets indexing status when bulk update is retried", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("asdf");
        (updateApplicationStatuses as jest.Mock).mockResolvedValue({
          transactionBlockNumber: 100,
        });
        (waitForSubgraphSyncTo as jest.Mock)
          .mockRejectedValueOnce(new Error(":("))
          .mockReturnValue(
            new Promise(() => {
              /* do nothing.*/
            })
          );

        renderWithProvider(<TestUseBulkUpdateGrantApplicationComponent />);
        fireEvent.click(screen.getByTestId("update-grant-application"));

        // retry bulk update operation
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_ERROR}`
        );
        fireEvent.click(screen.getByTestId("update-grant-application"));

        expect(
          screen.queryByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`)
        ).not.toBeInTheDocument();
      });
    });
  });
});

const TestUseBulkUpdateGrantApplicationComponent = () => {
  const {
    bulkUpdateGrantApplications,
    contractUpdatingStatus,
    indexingStatus,
  } = useBulkUpdateGrantApplications();

  return (
    <div>
      <button
        onClick={() => {
          bulkUpdateGrantApplications({} as BulkUpdateGrantApplicationParams);
        }}
        data-testid="update-grant-application"
      >
        Bulk Update Grant Applications
      </button>

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
