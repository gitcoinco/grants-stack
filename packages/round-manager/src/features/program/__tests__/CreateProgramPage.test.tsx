import { act, fireEvent, screen } from "@testing-library/react"
import {renderWrapped} from "../../../test-utils";
import CreateProgramPage from "../CreateProgramPage";
import { useWallet } from "../../common/Auth"

import { useSaveToIPFSMutation } from "../../api/services/ipfs";
import {useCreateProgramMutation} from "../../api/services/program";
import ErrorModal from "../../common/ErrorModal";

jest.mock("../../api/services/ipfs");
jest.mock("../../api/services/program");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
    ConnectButton: jest.fn(),
}))

describe('<CreateProgramPage />',  () => {
  let saveToIPFSStub;
  let createProgramStub;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    saveToIPFSStub = () => ({ unwrap: async () => Promise.resolve("asdfdsf") });
    (useSaveToIPFSMutation as jest.Mock).mockReturnValue(
      [
        saveToIPFSStub, {
        isError: true,
        isLoading: false,
        isSuccess: false
      }]);

    createProgramStub = () => ({ unwrap: async () => Promise.resolve("asdfdsf") });
    (useCreateProgramMutation as jest.Mock).mockReturnValue(
      [
        createProgramStub, {
        isError: true,
        isLoading: false,
        isSuccess: false
      }]);
  })

  it('shows error icon when saving application meta data fails', async () => {
      renderWrapped(<CreateProgramPage />);
      const save = screen.getByTestId('save');
      const programName = screen.getByTestId('program-name');
      await act(() => {
        fireEvent.change(programName, {target: {value: 'Program A'}})
        fireEvent.click(save);
      });

      await screen.findByTestId('metadata-save-error-icon');
  });

  it("shows error modal when saving application meta data fails", async () => {
    renderWrapped(<CreateProgramPage />);
    const save = screen.getByTestId('save');
    const programName = screen.getByTestId('program-name');
    await act(() => {
      fireEvent.change(programName, {target: {value: 'Program A'}})
      fireEvent.click(save);
    });

    expect(await screen.findByTestId('error-modal')).toBeInTheDocument();
  });

  it('choosing done closes the error modal', async () => {
    renderWrapped(<CreateProgramPage />);
    const save = screen.getByTestId('save');
    const programName = screen.getByTestId('program-name');
    await act(() => {
      fireEvent.change(programName, {target: {value: 'Program A'}})
      fireEvent.click(save);
    });

    const done = await screen.findByTestId("done");
    await act(() => {
      fireEvent.click(done);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  })
})