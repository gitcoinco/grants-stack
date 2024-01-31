import { saveToIPFS } from "../../../features/api/ipfs";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import { deployProgramContract } from "../../../features/api/program";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";
import {
  CreateProgramProvider,
  useCreateProgram,
} from "../CreateProgramContext";
import { faker } from "@faker-js/faker";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

jest.mock("../../../features/api/program");
jest.mock("../../../features/api/ipfs");
jest.mock("../../../features/api/subgraph");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("data-layer", () => ({
  useDataLayer: () => ({
    getProgramsByUser: jest.fn(),
  }),
}));

describe("<CreateProgramProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useCreateProgram()", () => {
    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (saveToIPFS as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createProgram = screen.getByTestId("create-program");
      fireEvent.click(createProgram);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets ipfs status to complete when saving to ipfs succeeds", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");
      (deployProgramContract as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createProgram = screen.getByTestId("create-program");
      fireEvent.click(createProgram);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets contract deployment status to in progress when contract is being deployed", async () => {
      const ipfsHash = "bafabcdef";
      (saveToIPFS as jest.Mock).mockResolvedValue(ipfsHash);
      (deployProgramContract as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createContract = screen.getByTestId("create-program");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `deploying-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
      const firstCall = (deployProgramContract as jest.Mock).mock.calls[0];
      const actualMetadataPointer = firstCall[0].program.store;
      expect(actualMetadataPointer).toEqual({
        protocol: 1,
        pointer: ipfsHash,
      });
    });

    it("sets contract deployment status to success when contract has been deployed", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("bafabcdef");
      (deployProgramContract as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createContract = screen.getByTestId("create-program");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `deploying-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });

    it("sets indexing status to in progress when waiting for subgraph to index", async () => {
      const transactionBlockNumber = 10;
      (saveToIPFS as jest.Mock).mockResolvedValue("bafabcdef");
      (deployProgramContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createContract = screen.getByTestId("create-program");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets indexing status to completed when subgraph is finished indexing", async () => {
      const transactionBlockNumber = 10;
      (saveToIPFS as jest.Mock).mockResolvedValue("bafabcdef");
      (deployProgramContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue(
        transactionBlockNumber
      );

      renderWithProvider(<TestUseCreateProgramComponent />);

      const createContract = screen.getByTestId("create-program");
      fireEvent.click(createContract);

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("useCreateProgram() Errors", () => {
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

      renderWithProvider(<TestUseCreateProgramComponent />);
      const createProgram = screen.getByTestId("create-program");
      fireEvent.click(createProgram);

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets contract deployment status to error when deployment fails", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("asdf");
      (deployProgramContract as jest.Mock).mockRejectedValue(
        new Error("Failed to deploy :(")
      );

      renderWithProvider(<TestUseCreateProgramComponent />);
      const createProgram = screen.getByTestId("create-program");
      fireEvent.click(createProgram);

      expect(
        await screen.findByTestId(
          `deploying-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();
    });

    it("sets indexing status to error when waiting for subgraph to sync fails", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("asdf");
      (deployProgramContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: 100,
      });
      (waitForSubgraphSyncTo as jest.Mock).mockRejectedValue(new Error(":("));

      renderWithProvider(<TestUseCreateProgramComponent />);
      const createProgram = screen.getByTestId("create-program");
      fireEvent.click(createProgram);

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_ERROR}`
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

      renderWithProvider(<TestUseCreateProgramComponent />);
      fireEvent.click(screen.getByTestId("create-program"));

      await screen.findByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`);

      // retry create-program operation
      fireEvent.click(screen.getByTestId("create-program"));

      expect(
        screen.queryByTestId(`storing-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });

    it("if contract deployment fails, resets contract deployment status when create round is retried", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("asdf");
      (deployProgramContract as jest.Mock).mockResolvedValue({
        transactionBlockNumber: 100,
      });
      (waitForSubgraphSyncTo as jest.Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateProgramComponent />);
      fireEvent.click(screen.getByTestId("create-program"));

      await screen.findByTestId(
        `indexing-status-is-${ProgressStatus.IS_ERROR}`
      );

      // retry create-program operation
      fireEvent.click(screen.getByTestId("create-program"));

      expect(
        screen.queryByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });

    it("if indexing fails, resets indexing status when create round is retried", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("asdf");
      (deployProgramContract as jest.Mock)
        .mockRejectedValueOnce(new Error(":("))
        .mockReturnValue(
          new Promise(() => {
            /* do nothing.*/
          })
        );

      renderWithProvider(<TestUseCreateProgramComponent />);
      fireEvent.click(screen.getByTestId("create-program"));

      await screen.findByTestId(
        `deploying-status-is-${ProgressStatus.IS_ERROR}`
      );

      // retry create-program operation
      fireEvent.click(screen.getByTestId("create-program"));

      expect(
        screen.queryByTestId(`deploying-status-is-${ProgressStatus.IS_ERROR}`)
      ).not.toBeInTheDocument();
    });
  });
});

const TestUseCreateProgramComponent = () => {
  const {
    createProgram,
    IPFSCurrentStatus,
    contractDeploymentStatus,
    indexingStatus,
  } = useCreateProgram();

  const programName = "My Cool Program";
  const operatorWallets = [faker.finance.ethereumAddress()];

  return (
    <div>
      <button
        onClick={() => createProgram(programName, operatorWallets)}
        data-testid="create-program"
      >
        Create My Program
      </button>

      <div data-testid={`storing-status-is-${IPFSCurrentStatus}`} />

      <div data-testid={`deploying-status-is-${contractDeploymentStatus}`} />

      <div data-testid={`indexing-status-is-${indexingStatus}`} />
    </div>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<CreateProgramProvider>{ui}</CreateProgramProvider>);
}
