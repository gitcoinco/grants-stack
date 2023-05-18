import { act, fireEvent, render, screen } from "@testing-library/react";
import CreateProgramPage from "../CreateProgramPage";
import { ProgressStatus } from "../../api/types";
import { saveToIPFS } from "../../api/ipfs";
import {
  CreateProgramContext,
  CreateProgramState,
  initialCreateProgramState,
} from "../../../context/program/CreateProgramContext";
import { MemoryRouter } from "react-router-dom";
import { useChainId, WagmiConfig } from "wagmi";
import { client } from "../../../app/wagmi";

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useChainId: jest.fn(),
}));

jest.mock("../../api/ipfs");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ...jest.requireActual("@rainbow-me/rainbowkit"),
  ConnectButton: jest.fn(),
}));

describe("<CreateProgramPage />", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    (saveToIPFS as jest.Mock).mockImplementation(() => {
      /* do nothing */
    });

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing */
    });

    (useChainId as jest.Mock).mockReturnValue(1);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("shows program chain tooltip", async () => {
    renderWithContext(<CreateProgramPage />);

    const tooltip = await screen.findByTestId("program-chain-tooltip");
    expect(tooltip).not.toBeNull();
  });

  it("displays wrong network when connected to unsupported network", async () => {
    (useChainId as jest.Mock).mockReturnValue(1239123);
    renderWithContext(<CreateProgramPage />);

    expect(await screen.findByText("Wrong Network")).toBeInTheDocument();
  });

  it("shows error modal when saving application meta data fails", async () => {
    renderWithContext(<CreateProgramPage />, {
      IPFSCurrentStatus: ProgressStatus.IS_ERROR,
    });

    expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
  });

  it("choosing done closes the error modal", async () => {
    renderWithContext(<CreateProgramPage />, {
      IPFSCurrentStatus: ProgressStatus.IS_ERROR,
    });

    const done = await screen.findByTestId("done");
    await act(() => {
      fireEvent.click(done);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });

  it("choosing try again restarts the action and closes the error modal", async () => {
    const saveToIPFSStub = saveToIPFS as jest.Mock;
    saveToIPFSStub.mockRejectedValue(new Error("Save to IPFS failed :("));

    renderWithContext(<CreateProgramPage />, {
      IPFSCurrentStatus: ProgressStatus.IS_ERROR,
    });
    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");
    await act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    const saveToIpfsCalls = saveToIPFSStub.mock.calls.length;
    expect(saveToIpfsCalls).toEqual(1);

    const tryAgain = await screen.findByTestId("tryAgain");
    await act(() => {
      fireEvent.click(tryAgain);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    expect(saveToIPFSStub.mock.calls.length).toEqual(saveToIpfsCalls + 1);
  });

  describe("when saving application metadata succeeds but create program transaction fails", () => {
    it("shows error modal when program contract deployment fails", async () => {
      renderWithContext(<CreateProgramPage />, {
        contractDeploymentStatus: ProgressStatus.IS_ERROR,
      });
      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  programStateOverrides: Partial<CreateProgramState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <WagmiConfig config={client}>
        <CreateProgramContext.Provider
          value={{
            state: { ...initialCreateProgramState, ...programStateOverrides },
            dispatch,
          }}
        >
          {ui}
        </CreateProgramContext.Provider>
      </WagmiConfig>
    </MemoryRouter>
  );
