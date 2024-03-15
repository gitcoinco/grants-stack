import { saveToIPFS } from "../../../features/api/ipfs";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressStatus, Round } from "../../../features/api/types";
import {
  UpdateRoundData,
  UpdateRoundProvider,
  useUpdateRound,
} from "../UpdateRoundContext";
import { makeRoundData } from "../../../test-utils";
import {
  AlloProvider,
  AlloV1,
  createMockTransactionSender,
  useAllo,
} from "common";
import { Hex } from "viem";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      return 1;
    },
  },
};

jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../features/api/round");
jest.mock("../../../features/api/ipfs");
jest.mock("../../../features/api/subgraph");

const mockRoundData: Round = makeRoundData();
const mockTransactionSender = createMockTransactionSender();

const mockWaitUntilIndexerSynced = jest.fn();

describe("<UpdateRoundProvider />", () => {
  function callUpdateRound() {
    const updateRound = screen.getByTestId("update-round");
    fireEvent.click(updateRound);
  }

  describe("Set IPFS Status", () => {
    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (saveToIPFS as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets ipfs status to complete when saving to ipfs succeeds", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `storing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Update Status", () => {
    it("sets update status to in progress when updating round", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");

      jest.spyOn(mockTransactionSender, "send").mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `update-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets update status to success when updating round succeeds", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `update-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });

  describe("Set Indexing Status", () => {
    it("sets indexing status to in progress when updating round", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");

      (mockWaitUntilIndexerSynced as jest.Mock).mockResolvedValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      );
    });

    it("sets indexing status to success when updating round succeeds", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");

      renderWithProvider(
        <TestUseUpdateRoundComponent mockRoundData={mockRoundData} />
      );
      callUpdateRound();

      expect(
        await screen.findByTestId(
          `indexing-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      );
    });
  });
});

const TestUseUpdateRoundComponent = ({
  mockRoundData,
}: {
  mockRoundData: Round;
}) => {
  const { updateRound, IPFSCurrentStatus, roundUpdateStatus, indexingStatus } =
    useUpdateRound();
  const allo = useAllo();

  return (
    <div>
      <button
        onClick={() =>
          updateRound({
            roundId: mockRoundData.id as Hex,
            data: mockRoundData,
            allo,
          } as unknown as UpdateRoundData)
        }
        data-testid="update-round"
      >
        Update My Round
      </button>

      <div data-testid={`storing-status-is-${IPFSCurrentStatus}`} />

      <div data-testid={`update-status-is-${roundUpdateStatus}`} />

      <div data-testid={`indexing-status-is-${indexingStatus}`} />
    </div>
  );
};

const alloBackend = new AlloV1({
  chainId: 1,
  ipfsUploader: async () =>
    Promise.resolve({
      type: "success",
      value: "ipfsHash",
    }),
  waitUntilIndexerSynced: mockWaitUntilIndexerSynced,
  transactionSender: mockTransactionSender,
});

function renderWithProvider(ui: JSX.Element) {
  render(
    <AlloProvider backend={alloBackend}>
      <UpdateRoundProvider>{ui}</UpdateRoundProvider>
    </AlloProvider>
  );
}
