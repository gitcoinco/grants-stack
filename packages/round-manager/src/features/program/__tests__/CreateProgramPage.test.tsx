import { act, fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import CreateProgramPage from "../CreateProgramPage";
import { useWallet } from "../../common/Auth";

import { useSaveToIPFSMutation } from "../../api/services/ipfs";
import { useCreateProgramMutation } from "../../api/services/program";

jest.mock("../../api/services/ipfs");
jest.mock("../../api/services/program");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("<CreateProgramPage />", () => {
  let saveToIPFSStub: jest.MockedFn<any>;
  let createProgramStub: () => any;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    saveToIPFSStub = jest.fn().mockImplementation(() => ({
      unwrap: async () => Promise.resolve("asdfdsf"),
    }));
    (useSaveToIPFSMutation as jest.Mock).mockReturnValue([
      saveToIPFSStub,
      {
        isError: true,
        isLoading: false,
        isSuccess: false,
      },
    ]);

    createProgramStub = () => ({
      unwrap: async () => Promise.resolve("asdfdsf"),
    });
    (useCreateProgramMutation as jest.Mock).mockReturnValue([
      createProgramStub,
      {
        isError: false,
        isLoading: false,
        isSuccess: false,
      },
    ]);
  });

  it("shows error modal when saving application meta data fails", async () => {
    renderWrapped(<CreateProgramPage />);
    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");
    await act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
  });

  it("choosing done closes the error modal", async () => {
    renderWrapped(<CreateProgramPage />);
    const save = screen.getByTestId("save");
    const programName = screen.getByTestId("program-name");
    await act(() => {
      fireEvent.change(programName, { target: { value: "Program A" } });
      fireEvent.click(save);
    });

    const done = await screen.findByTestId("done");
    await act(() => {
      fireEvent.click(done);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });

  it("choosing try again restarts the action and closes the error modal", async () => {
    renderWrapped(<CreateProgramPage />);
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
    beforeEach(() => {
      (useSaveToIPFSMutation as jest.Mock).mockReturnValue([
        saveToIPFSStub,
        {
          isError: false,
          isLoading: false,
          isSuccess: true,
        },
      ]);

      (useCreateProgramMutation as jest.Mock).mockReturnValue([
        createProgramStub,
        {
          isError: true,
          isLoading: false,
          isSuccess: false,
        },
      ]);
    });

    it("shows error modal when create program transaction fails", async () => {
      renderWrapped(<CreateProgramPage />);
      const save = screen.getByTestId("save");
      const programName = screen.getByTestId("program-name");
      await act(() => {
        fireEvent.change(programName, { target: { value: "Program A" } });
        fireEvent.click(save);
      });

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });
  });
});
