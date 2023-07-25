import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import CreateProgramPage from "../CreateProgramPage";
import { useWallet } from "../../common/Auth";
import { ProgressStatus } from "../../api/types";
import { saveToIPFS } from "../../api/ipfs";
import {
  CreateProgramContext,
  CreateProgramState,
  initialCreateProgramState,
} from "../../../context/program/CreateProgramContext";
import { MemoryRouter } from "react-router-dom";
import { errorModalDelayMs } from "../../../constants";

jest.mock("../../api/ipfs");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("<CreateProgramPage />", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    (saveToIPFS as jest.Mock).mockImplementation(() => {
      /* do nothing */
    });

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing */
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("shows program chain tooltip", async () => {
    renderWithContext(<CreateProgramPage />);

    expect(
      await screen.findByTestId("program-chain-tooltip")
    ).toBeInTheDocument();
  });

  it("displays wrong network when connected to unsupported network", async () => {
    renderWithContext(<CreateProgramPage />);

    expect(await screen.findByText("Wrong Network")).toBeInTheDocument();
  });

  it("shows error modal when saving application meta data fails", async () => {
    renderWithContext(<CreateProgramPage />, {
      IPFSCurrentStatus: ProgressStatus.IS_ERROR,
    });

    await waitFor(
      async () =>
        expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
      { timeout: errorModalDelayMs + 1000 }
    );
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
      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
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
      <CreateProgramContext.Provider
        value={{
          state: { ...initialCreateProgramState, ...programStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </CreateProgramContext.Provider>
    </MemoryRouter>
  );
