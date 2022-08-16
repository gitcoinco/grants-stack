import ViewProgram from "../ViewProgramPage"
import { screen } from "@testing-library/react"
import { useListProgramsQuery } from "../../api/services/program"
import { useListRoundsQuery } from "../../api/services/round"
import { useWallet } from "../../common/Auth"
import { makeProgramData, makeRoundData, renderWrapped } from "../../../test-utils"
import { faker } from "@faker-js/faker"

jest.mock("../../common/Navbar")
jest.mock("../../common/Auth")
jest.mock("../../api/services/program")
jest.mock("../../api/services/round")
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}))


describe("<ViewProgram />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    (useListRoundsQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false, isSuccess: true });
  });

  it("displays the program name", async () => {
    const stubProgram = makeProgramData();
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
    const stubProgram = makeProgramData({ operatorWallets });
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
      const stubProgram = makeProgramData();
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });

      renderWrapped(<ViewProgram />);

      await screen.findAllByTestId("program-details-intro");
    })
  });

  describe("when there is a round in the program", () => {
    it("displays round name", async () => {
      const stubProgram = makeProgramData();
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
      (useListProgramsQuery as jest.Mock).mockReturnValue({ program: stubProgram });
      (useListRoundsQuery as jest.Mock).mockReturnValue({
        data: [stubRound],
        isLoading: false, isSuccess: true
      });

      renderWrapped(<ViewProgram />);

      expect(screen.getByText(stubRound.roundMetadata?.name!!)).toBeInTheDocument();
    });

    it("displays grant application start and end dates", async () => {
      const stubProgram = makeProgramData();
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
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
      const stubProgram = makeProgramData();
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
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
      const stubProgram = makeProgramData();
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
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
