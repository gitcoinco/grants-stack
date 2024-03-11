import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AlloOperation, useAllo } from "common";
import { error } from "common/dist/allo/common";
import { success } from "common/src/allo/common";
import { MemoryRouter } from "react-router-dom";
import { zeroAddress } from "viem";
import { errorModalDelayMs } from "../../../constants";
import { useWallet } from "../../common/Auth";
import CreateProgramPage from "../CreateProgramPage";

jest.mock("../../api/ipfs");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
    getProgramsByUser: jest.fn(),
  }),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

describe("<CreateProgramPage />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: {},
      address: zeroAddress,
    });
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

  it("submitting form calls allo interface with correct data", async () => {
    const createProgram = jest.fn(
      () =>
        new AlloOperation(async () => {
          return success({ programId: "1" });
        })
    );

    (useAllo as jest.Mock).mockReturnValue({
      createProgram,
    });

    renderWithContext(<CreateProgramPage />);

    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");

    act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    await waitFor(() => {
      expect(createProgram).toHaveBeenCalledWith({
        name: "Program A",
        memberAddresses: [zeroAddress],
      });
    });
  });

  it("shows error modal when saving metadata fails", async () => {
    (useAllo as jest.Mock).mockReturnValue({
      createProgram: () =>
        new AlloOperation(async ({ emit }) => {
          emit("ipfs", error(new Error("Save to IPFS failed :(")));
        }),
    });

    renderWithContext(<CreateProgramPage />);

    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");

    act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    await waitFor(
      async () =>
        expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
      { timeout: errorModalDelayMs + 1000 }
    );
  });

  it("pressing done closes error modal", async () => {
    (useAllo as jest.Mock).mockReturnValue({
      createProgram: () =>
        new AlloOperation(async ({ emit }) => {
          emit("ipfs", error(new Error("Save to IPFS failed :(")));
        }),
    });

    renderWithContext(<CreateProgramPage />);

    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");

    act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    await waitFor(
      async () =>
        expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
      { timeout: errorModalDelayMs + 1000 }
    );

    const done = await screen.findByTestId("done");

    act(() => {
      fireEvent.click(done);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });
});

export const renderWithContext = (ui: JSX.Element) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);
