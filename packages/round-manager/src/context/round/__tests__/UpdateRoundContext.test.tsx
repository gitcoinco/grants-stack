import { saveToIPFS } from "../../../features/api/ipfs";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  EditedGroups,
  ProgressStatus,
  Round,
} from "../../../features/api/types";
import {
  UpdateRoundData,
  UpdateRoundProvider,
  useUpdateRound,
} from "../UpdateRoundContext";
import { TransactionBuilder } from "../../../features/api/round";
import { makeRoundData } from "../../../test-utils";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";

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

const executeSpy = (execute: boolean) => {
  if (!execute)
    // return function which does nothing
    return jest
      .spyOn(TransactionBuilder.prototype, "execute")
      .mockImplementation(function () {
        return new Promise(() => {
          /* do nothing. */
        }) as unknown as Promise<TransactionResponse>;
      });

  if (execute)
    return jest
      .spyOn(TransactionBuilder.prototype, "execute")
      .mockImplementation(async function (): Promise<TransactionResponse> {
        const receipt: any = {
          blockNumber: 123,
        };

        const response: any = {
          wait: async (): Promise<TransactionReceipt> => {
            return receipt as unknown as TransactionReceipt;
          },
        };

        return response as unknown as TransactionResponse;
      });
};

describe("<UpdateRoundProvider />", () => {
  function callUpdateRound() {
    const updateRound = screen.getByTestId("update-round");
    fireEvent.click(updateRound);
  }

  describe("Set IPFS Status", () => {
    const mockEditedGroups: EditedGroups = {
      ApplicationMetaPointer: false,
      MatchAmount: false,
      RoundFeeAddress: false,
      RoundFeePercentage: false,
      RoundMetaPointer: true,
      StartAndEndTimes: false,
    };

    it("sets ipfs status to in progress when saving to ipfs", async () => {
      (saveToIPFS as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
    const mockEditedGroups: EditedGroups = {
      ApplicationMetaPointer: false,
      MatchAmount: false,
      RoundFeeAddress: false,
      RoundFeePercentage: false,
      RoundMetaPointer: true,
      StartAndEndTimes: false,
    };

    it("sets update status to in progress when updating round", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");
      executeSpy(false);

      renderWithProvider(
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
      executeSpy(true);

      renderWithProvider(
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
    const mockEditedGroups: EditedGroups = {
      ApplicationMetaPointer: false,
      MatchAmount: false,
      RoundFeeAddress: false,
      RoundFeePercentage: false,
      RoundMetaPointer: true,
      StartAndEndTimes: false,
    };

    it("sets indexing status to in progress when updating round", async () => {
      (saveToIPFS as jest.Mock).mockResolvedValue("my ipfs doc :)))");
      executeSpy(true);

      (waitForSubgraphSyncTo as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
      executeSpy(true);

      renderWithProvider(
        <TestUseUpdateRoundComponent
          mockEditedGroups={mockEditedGroups}
          mockRoundData={mockRoundData}
        />
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
  mockEditedGroups,
  mockRoundData,
}: {
  mockEditedGroups: EditedGroups;
  mockRoundData: Round;
}) => {
  const { updateRound, IPFSCurrentStatus, roundUpdateStatus, indexingStatus } =
    useUpdateRound();

  return (
    <div>
      <button
        onClick={() =>
          updateRound({
            round: mockRoundData,
            editedGroups: mockEditedGroups,
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

function renderWithProvider(ui: JSX.Element) {
  render(<UpdateRoundProvider>{ui}</UpdateRoundProvider>);
}
