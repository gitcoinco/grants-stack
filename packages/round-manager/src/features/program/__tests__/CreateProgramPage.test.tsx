import {fireEvent, screen} from "@testing-library/react"
import {renderWrapped} from "../../../test-utils";
import CreateProgramPage from "../CreateProgramPage";
import { useWallet } from "../../common/Auth"

import { useSaveToIPFSMutation } from "../../api/services/ipfs";
import {useCreateProgramMutation} from "../../api/services/program";

jest.mock("../../api/services/ipfs");
jest.mock("../../api/services/program");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
    ConnectButton: jest.fn(),
}))

describe('<CreateProgramPage />',  () => {
    it('shows error icon when saving application meta data fails', async () => {
        (useWallet as jest.Mock).mockReturnValue({ chain: {} });
        let saveToIPFSStub = () => ({ unwrap: async () => Promise.resolve("asdfdsf") });
        (useSaveToIPFSMutation as jest.Mock).mockReturnValue(
    [
            saveToIPFSStub, {
            isError: true,
            isLoading: false,
            isSuccess: false
        }]);
        let createProgramStub = () => ({ unwrap: async () => Promise.resolve("asdfdsf") });
        (useCreateProgramMutation as jest.Mock).mockReturnValue(
            [
                createProgramStub, {
                isError: true,
                isLoading: false,
                isSuccess: false
            }]);

        renderWrapped(<CreateProgramPage />);
        const save = screen.getByTestId('save');
        const programName = screen.getByTestId('program-name');
        fireEvent.change(programName, {target: {value: 'Program A'}})
        fireEvent.click(save);

        await screen.findByTestId('metadata-save-error-icon');
    });
});