/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { RoundApplicationForm } from "../RoundApplicationForm";
import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import { MemoryRouter } from "react-router-dom";
import {
  CreateRoundContext,
  CreateRoundState,
  initialCreateRoundState,
} from "../../../context/round/CreateRoundContext";
import { ProgressStatus } from "../../api/types";
import { saveToIPFS } from "../../api/ipfs";
import { deployRoundContract } from "../../api/round";
import { waitForSubgraphSyncTo } from "../../api/subgraph";

jest.mock("../../api/ipfs");
jest.mock("../../api/round");
jest.mock("../../api/subgraph");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("<RoundApplicationForm />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: { name: "my blockchain" },
      provider: {
        getNetwork: () => ({
          chainId: 0,
        }),
      },
      signer: {
        getChainId: () => 0,
      },
      address: "0x0",
    });
    (saveToIPFS as jest.Mock).mockResolvedValue("some ipfs hash");
    (deployRoundContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: 0,
    });
    (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue(0);
  });

  describe("when saving metadata fails", () => {
    it("shows error modal when saving round application metadata fails", async () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      await act(() => {
        fireEvent.click(launch);
      });

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });

    it("choosing done closes the error modal", async () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      await act(() => {
        fireEvent.click(launch);
      });

      const done = await screen.findByTestId("done");
      await act(() => {
        fireEvent.click(done);
      });

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });

    it("choosing try again restarts the action and closes the error modal", async () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );

      const launch = screen.getByRole("button", { name: /Launch/i });
      await act(() => {
        fireEvent.click(launch);
      });

      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      const saveToIpfsCalls = (saveToIPFS as jest.Mock).mock.calls.length;
      expect(saveToIpfsCalls).toEqual(2);

      const tryAgain = await screen.findByTestId("tryAgain");
      await act(() => {
        fireEvent.click(tryAgain);
      });

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      expect((saveToIPFS as jest.Mock).mock.calls.length).toEqual(
        saveToIpfsCalls + 2
      );
    });
  });

  describe("when saving round application metadata succeeds but create round transaction fails", () => {
    const createRoundStateOverride = {
      IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
      contractDeploymentStatus: ProgressStatus.IS_ERROR,
    };

    it("shows error modal when create round transaction fails", async () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />,
        createRoundStateOverride
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      await act(() => {
        fireEvent.click(launch);
      });

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  createRoundStateOverrides: Partial<CreateRoundState> = {},
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <CreateRoundContext.Provider
        value={{
          state: { ...initialCreateRoundState, ...createRoundStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </CreateRoundContext.Provider>
    </MemoryRouter>
  );
