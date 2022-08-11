import { screen } from "@testing-library/react"
import { useWallet } from "../../common/Auth"
import { useListRoundsQuery } from "../../api/services/round"
import ViewRoundPage from "../ViewRoundPage"
import { GrantApplication, Round } from "../../api/types"
import { makeRoundData, renderWrapped, makeProgramData, makeGrantApplicationData } from "../../../test-utils"
import { useListGrantApplicationsQuery } from "../../api/services/grantApplication"
import { useListProgramsQuery } from "../../api/services/program"
import {useDisconnect, useSwitchNetwork} from "wagmi"

jest.mock("../../common/Auth");
jest.mock("../../api/services/round");
jest.mock("../../api/services/grantApplication");
jest.mock("../../api/services/program");
jest.mock("wagmi");

const mockRoundData: Round = makeRoundData();
const mockProgramData = makeProgramData({
    id: mockRoundData.ownedBy
});
const mockApplicationData: GrantApplication[] = [];

describe('the view round page', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useWallet as jest.Mock).mockReturnValue({chain: {}});

        (useListRoundsQuery as jest.Mock).mockReturnValue({
            data: mockRoundData,
            isLoading: false,
            isSuccess: true
        });

        (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
            data: mockApplicationData,
            isLoading: false,
            isSuccess: true
        });

        (useSwitchNetwork as jest.Mock).mockReturnValue({chains: []});
        (useDisconnect as jest.Mock).mockReturnValue({});

        (useListProgramsQuery as jest.Mock).mockReturnValue({program: mockProgramData});
    })

    test("should display copy when there are no applicants for a given round", () => {
        renderWrapped(<ViewRoundPage/>);
        expect(screen.getByText("No Applications")).toBeInTheDocument();
    })

    test("should indicate how many of each kind of application there are", () => {
        const mockApplicationData: GrantApplication[] = [
            makeGrantApplicationData({status: "PENDING"}),
            makeGrantApplicationData({status: "PENDING"}),
            makeGrantApplicationData({status: "REJECTED"}),
            makeGrantApplicationData({status: "APPROVED"}),
        ];
        (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
            data: mockApplicationData,
            isLoading: false,
            isSuccess: true
        });

        renderWrapped(<ViewRoundPage/>);

        expect(parseInt(screen.getByTestId('received-application-counter').textContent!!)).toBe(2)
        expect(parseInt(screen.getByTestId('rejected-application-counter').textContent!!)).toBe(1)
        expect(parseInt(screen.getByTestId('approved-application-counter').textContent!!)).toBe(1)
    })
})
