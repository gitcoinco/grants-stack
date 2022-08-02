import ViewProgram from "./ViewProgramPage"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { store } from "../../app/store"
import history from "../../history"
import { useListProgramsQuery } from "../api/services/program"
import { useListRoundsQuery } from "../api/services/round";
import { useWallet } from "../common/Auth"
import { ReduxRouter } from "@lagunovsky/redux-react-router"
import { client as WagmiClient } from "../../app/wagmi"
import { WagmiConfig } from "wagmi"
import { makeStubProgram, makeStubRound } from "../../test-utils"
import { faker } from "@faker-js/faker"

jest.mock("../common/Navbar")
jest.mock("../common/Auth")
jest.mock("../api/services/program")
jest.mock("../api/services/round")


describe("<ViewProgram />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    (useListRoundsQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false, isSuccess: true });
  });

  it("displays the program name", async () => {
    const stubProgram = makeStubProgram();
    (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram })

    renderWrapped(<ViewProgram />)

    await screen.findByText(stubProgram.metadata!.name)
  })

  it("displays a list of operator wallets", async () => {
    let operatorWallets = [
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
    ];
    const stubProgram = makeStubProgram({ operatorWallets });
    (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });

    renderWrapped(<ViewProgram />);

    const wallets = await screen.findAllByTestId("program-operator-wallet")
    expect(wallets.length).toEqual(operatorWallets.length);
  })

  describe("when there are no rounds in the program", () => {
    beforeEach(() => {
      (useListRoundsQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false, isSuccess: true });
    });

    it("displays introductory text on the page", async () => {
      const stubProgram = makeStubProgram();
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });

      renderWrapped(<ViewProgram />);

      await screen.findAllByTestId("program-details-intro");
    })
  });

  describe("when there is a round in the program", () => {
    it("displays round name", async () => {
      const stubProgram = makeStubProgram();
      const stubRound = makeStubRound({ ownedBy: stubProgram.id });
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });
      (useListRoundsQuery as jest.Mock).mockReturnValue({
        data: [stubRound],
        isLoading: false, isSuccess: true
      });

      renderWrapped(<ViewProgram />);

      expect(screen.getByText(stubRound.roundMetadata?.name!!)).toBeInTheDocument();
    });

    it("displays grant application start and end dates", async () => {
      const stubProgram = makeStubProgram();
      const stubRound = makeStubRound({ ownedBy: stubProgram.id });
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });
      (useListRoundsQuery as jest.Mock).mockReturnValue({
        data: [stubRound],
        isLoading: false, isSuccess: true
      });

      renderWrapped(<ViewProgram />);

      const applicationTimePeriod = await screen.findByTestId("application-time-period");
      expect(applicationTimePeriod.textContent).toEqual(`${stubRound.applicationsStartTime.toLocaleDateString()} - ${stubRound.applicationsEndTime.toLocaleDateString()}`);
    });

    it("displays round start and end dates", async () => {
      const stubProgram = makeStubProgram();
      const stubRound = makeStubRound({ ownedBy: stubProgram.id });
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });
      (useListRoundsQuery as jest.Mock).mockReturnValue({
        data: [stubRound],
        isLoading: false, isSuccess: true
      });

      renderWrapped(<ViewProgram />);

      const roundTimePeriodElement = await screen.findByTestId("round-time-period");
      expect(roundTimePeriodElement.textContent).toEqual(`${stubRound.roundStartTime.toLocaleDateString()} - ${stubRound.roundEndTime.toLocaleDateString()}`);
    });

    it("displays create round link", async () => {
      const stubProgram = makeStubProgram();
      const stubRound = makeStubRound({ ownedBy: stubProgram.id });
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });
      (useListRoundsQuery as jest.Mock).mockReturnValue({
        data: [stubRound],
        isLoading: false, isSuccess: true
      });

      renderWrapped(<ViewProgram />);

      await screen.findByTestId("create-round-small-link");
    })
  })
})

const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={ store }>
      <WagmiConfig client={ WagmiClient }>
        <ReduxRouter store={ store } history={ history }>
          { ui }
        </ReduxRouter>
      </WagmiConfig>
    </Provider>
  )
}
