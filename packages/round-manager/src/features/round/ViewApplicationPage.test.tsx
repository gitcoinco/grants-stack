import { makeGrantApplicationData, makeProjectCredentialData, renderWrapped } from "../../test-utils"
import ViewApplicationPage from "./ViewApplicationPage"
import { screen, waitFor } from "@testing-library/react"
import { useListRoundsQuery } from "../api/services/round"
import { useListGrantApplicationsQuery, useUpdateGrantApplicationMutation } from "../api/services/grantApplication"
import { useSwitchNetwork, useDisconnect } from "wagmi"
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier"

jest.mock("../api/services/grantApplication")
jest.mock("wagmi")
jest.mock("../api/services/round")
jest.mock("@gitcoinco/passport-sdk-verifier")
jest.mock("../common/Auth", () => ({
  useWallet: () => ({ provider: {} })
}))

const verifyCredentialMock = jest.spyOn(PassportVerifier.prototype, 'verifyCredential')

describe('ViewApplicationPage', () => {
  it.each(["github", "twitter"])("shows no project %s verification when you have an invalid verifiable credential for it", async (provider) => {
    verifyCredentialMock.mockResolvedValue(false)

    const verifiableGithubCredential = {
      application: makeGrantApplicationData({},
        makeProjectCredentialData([provider]))
    };

    (useListGrantApplicationsQuery as any).mockReturnValue(verifiableGithubCredential);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([jest.fn(), { isLoading: false }]);
    (useListRoundsQuery as any).mockReturnValue({ round: {} });
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({})

    await renderWrapped(<ViewApplicationPage/>)

    await waitFor(() => {
      expect(screen.getByTestId(`${ provider }-verifiable-credential-unverified`)).toBeInTheDocument()
    })

    expect(screen.queryByTestId(`${ provider }-verifiable-credential`)).not.toBeInTheDocument()
  })

  it.each(["github", "twitter"])("shows no project %s verification when you do not have a verifiable credential for it", async (provider) => {
    const noGithubVerification = {
      application: makeGrantApplicationData(),
      isLoading: false
    };
    (useListGrantApplicationsQuery as any).mockReturnValue(noGithubVerification);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([jest.fn(), { isLoading: false }]);
    (useListRoundsQuery as any).mockReturnValue({ round: {} });
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({})

    await renderWrapped(<ViewApplicationPage/>)

    await waitFor(() => {
      expect(screen.getByTestId(`${provider}-info`)).toBeInTheDocument();
    })

    expect(screen.queryByTestId(`${ provider }-verifiable-credential`)).not.toBeInTheDocument()
  })

  it.each(["github", "twitter"])("shows project %s verification when you have a valid verifiable credential for it", async (provider) => {
    verifyCredentialMock.mockResolvedValue(true)

    const verifiableGithubCredential = {
      application: makeGrantApplicationData({},
        makeProjectCredentialData([provider]))
    };

    (useListGrantApplicationsQuery as any).mockReturnValue(verifiableGithubCredential);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([jest.fn(), { isLoading: false }]);
    (useListRoundsQuery as any).mockReturnValue({ round: {} });
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({})

    await renderWrapped(<ViewApplicationPage/>)

    expect(await screen.findByTestId(`${ provider }-verifiable-credential`)).toBeInTheDocument()
  })
})
