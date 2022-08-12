import {makeGrantApplicationData, renderWrapped} from "../../test-utils";
import ViewApplicationPage from "./ViewApplicationPage";
import {screen} from "@testing-library/react"
import { useListRoundsQuery } from "../api/services/round"
import {useListGrantApplicationsQuery, useUpdateGrantApplicationMutation} from "../api/services/grantApplication";
import { useSwitchNetwork, useDisconnect } from "wagmi";

/*jest.mock("../api/services/grantApplication", () => ({
    useListGrantApplicationsQuery: () => ({application: makeGrantApplicationData(), isLoading: false}),
    useUpdateGrantApplicationMutation: () => ([()=> {}, {isLoading: false}])
}));*/
jest.mock("../api/services/grantApplication");
jest.mock("wagmi");
jest.mock("../api/services/round");
jest.mock("../common/Auth", () => ({
    useWallet: () => ({ provider: {} })
}))

describe('ViewApplicationPage', () => {

    it('shows no github credentials when there are none', async () => {
       (useListGrantApplicationsQuery as any).mockReturnValue({ application: makeGrantApplicationData(), isLoading: false});
       (useUpdateGrantApplicationMutation as any).mockReturnValue([jest.fn(), {isLoading: false}]);
       (useListRoundsQuery as any).mockReturnValue({round: {}});
       (useSwitchNetwork as any).mockReturnValue({chains: []});
       (useDisconnect as any).mockReturnValue({});

        await renderWrapped(<ViewApplicationPage />);

        expect(screen.queryByTestId("github-verified-credential")).not.toBeInTheDocument();
    });



});