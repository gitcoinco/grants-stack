import {Provider} from "react-redux"
import {store} from "../../app/store"
import {render, screen} from "@testing-library/react"
import {useWallet} from "../common/Auth"
import {useListRoundsQuery} from "../api/services/round"
import history from "../../history"
import {ReduxRouter} from "@lagunovsky/redux-react-router"
import ViewRoundPage from "./ViewRoundPage"
import {client as WagmiClient} from "../../app/wagmi";
import {WagmiConfig} from "wagmi";
import {GrantApplication, Round} from "../api/types";
import {makeStubApplication, makeStubProgram, makeStubRound} from "../../test-utils";
import {useListGrantApplicationsQuery} from "../api/services/grantApplication";
import {useListProgramsQuery} from "../api/services/program";

jest.mock("../common/Auth");
jest.mock("../api/services/round");
jest.mock("../api/services/grantApplication");
jest.mock("../api/services/program");

const mockRoundData: Round = makeStubRound();
const mockProgramData = makeStubProgram({
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

        (useListProgramsQuery as jest.Mock).mockReturnValue({program: mockProgramData});
    })

    test("should display copy when there are no applicants for a given round", () => {
        render(
            <Provider store={store}>
                <WagmiConfig client={WagmiClient}>
                    <ReduxRouter history={history} store={store}>
                        <ViewRoundPage/>
                    </ReduxRouter>
                </WagmiConfig>
            </Provider>
        )
        expect(screen.getByText("No Applications")).toBeInTheDocument();
    })

    test("should render applicant data when a given round has applications", () => {
        const mockApplicationData: GrantApplication[] = [
            makeStubApplication({
                status: "PENDING"
            }),
            makeStubApplication({
                status: "PENDING"
            })
        ];
        (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
            data: mockApplicationData,
            isLoading: false,
            isSuccess: true
        });
        const expectedApplications: Array<{ name: string, description: string }> =
            mockApplicationData.map(mockApplication => ({ name: mockApplication.project.title, description: mockApplication.project.description }))

        render(
            <Provider store={store}>
                <WagmiConfig client={WagmiClient}>
                    <ReduxRouter history={history} store={store}>
                        <ViewRoundPage/>
                    </ReduxRouter>
                </WagmiConfig>
            </Provider>
        )

        expect(parseInt(screen.getByTestId('received-application-counter').textContent!!)).toBe(2)
        // TODO(shavinac) move assertion to Tab test
        // expect(screen.getAllByTestId('round-application').length).toBe(2)

        expectedApplications.forEach((a) => {
            expect(screen.getByText(a.name)).toBeInTheDocument()
            expect(screen.getByText(a.description)).toBeInTheDocument()
        })
    })
})