import ViewProgram from "../ViewProgramPage";
import { render, screen } from "@testing-library/react";
import { useWallet } from "../../common/Auth";
import {
  makeProgramData,
  makeRoundData,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { Program, ProgressStatus } from "../../api/types";
import { getUTCDate } from "../../api/utils";

const programId = faker.datatype.number().toString();
const useParamsFn = () => ({ id: programId });

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("../../api/program");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("<ViewProgram />", () => {
  let stubProgram: Program;

  beforeEach(() => {
    jest.clearAllMocks();

    stubProgram = makeProgramData({ id: programId });

    (useWallet as jest.Mock).mockReturnValue({
      chain: {},
      address: stubProgram.operatorWallets[0],
      provider: { getNetwork: () => ({ chainId: "0x0" }) },
    });
  });

  it("should display NotFoundPage when no program is found", () => {
    render(
      wrapWithReadProgramContext(wrapWithRoundContext(<ViewProgram />), {
        programs: [],
        fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
      })
    );

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("should display access denied when wallet accessing is not program operator", () => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: {},
      address: faker.finance.ethereumAddress(),
      provider: { getNetwork: () => ({ chainId: "0x0" }) },
    });

    render(
      wrapWithReadProgramContext(
        wrapWithRoundContext(<ViewProgram />, {
          data: [],
          fetchRoundStatus: ProgressStatus.IS_SUCCESS,
        }),
        {
          programs: [stubProgram],
          fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
        }
      )
    );
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  });

  it("displays the program name", async () => {
    render(
      wrapWithReadProgramContext(
        wrapWithRoundContext(<ViewProgram />, {
          data: [],
          fetchRoundStatus: ProgressStatus.IS_SUCCESS,
        }),
        {
          programs: [stubProgram],
          fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
        }
      )
    );

    await screen.findByText(stubProgram.metadata.name);
  });

  it("displays a list of operator wallets for a program", async () => {
    const operatorWallets = [
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
    ];

    const stubProgram = makeProgramData({ id: programId, operatorWallets });
    (useWallet as jest.Mock).mockReturnValue({
      chain: {},
      address: stubProgram.operatorWallets[0],
      provider: { getNetwork: () => ({ chainId: "0x0" }) },
    });

    render(
      wrapWithReadProgramContext(
        wrapWithRoundContext(<ViewProgram />, {
          data: [],
          fetchRoundStatus: ProgressStatus.NOT_STARTED,
        }),
        {
          programs: [stubProgram],
          fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
        }
      )
    );

    const wallets = await screen.findAllByTestId("program-operator-wallet");
    expect(wallets.length).toEqual(operatorWallets.length);
  });

  it("displays a loading spinner if loading program", () => {
    render(
      wrapWithReadProgramContext(
        wrapWithRoundContext(<ViewProgram />, {
          data: [],
          fetchRoundStatus: ProgressStatus.NOT_STARTED,
        }),
        { fetchProgramsStatus: ProgressStatus.IN_PROGRESS }
      )
    );

    screen.getByTestId("loading-spinner");
  });

  describe("when there are no rounds in the program", () => {
    it("displays introductory text on the page", async () => {
      render(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewProgram />, {
            data: [],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          {
            programs: [stubProgram],
            fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
          }
        )
      );

      await screen.findAllByTestId("program-details-intro");
    });
  });

  describe("when there is a round in the program", () => {
    it("displays round name", async () => {
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });

      render(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewProgram />, {
            data: [stubRound],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          {
            programs: [stubProgram],
            fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
          }
        )
      );

      expect(
        screen.getByText(stubRound.roundMetadata.name)
      ).toBeInTheDocument();
    });

    it("displays grant application start and end dates", async () => {
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });

      render(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewProgram />, {
            data: [stubRound],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          {
            programs: [stubProgram],
            fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
          }
        )
      );

      const applicationStartTimePeriod = await screen.findByTestId(
        "application-start-time-period"
      );
      const applicationEndTimePeriod = await screen.findByTestId(
        "application-end-time-period"
      );

      const utcApplicationStartTime = getUTCDate(
        stubRound!.applicationsStartTime
      );
      const utcApplicationEndTime = getUTCDate(stubRound!.applicationsEndTime);

      expect(applicationStartTimePeriod.textContent).toEqual(
        utcApplicationStartTime
      );
      expect(applicationEndTimePeriod.textContent).toEqual(
        utcApplicationEndTime
      );
    });

    it("displays round start and end dates", async () => {
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
      render(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewProgram />, {
            data: [stubRound],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          {
            programs: [stubProgram],
            fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
          }
        )
      );

      const roundStartTimePeriodElement = await screen.findByTestId(
        "round-start-time-period"
      );
      const roundEndTimePeriodElement = await screen.findByTestId(
        "round-end-time-period"
      );

      const utcRoundStartTime = getUTCDate(stubRound!.roundStartTime);
      const utcRoundEndTime = getUTCDate(stubRound!.roundEndTime);

      expect(roundStartTimePeriodElement.textContent).toEqual(
        utcRoundStartTime
      );
      expect(roundEndTimePeriodElement.textContent).toEqual(utcRoundEndTime);
    });

    it("displays create round link", async () => {
      const stubRound = makeRoundData({ ownedBy: stubProgram.id });
      render(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewProgram />, {
            data: [stubRound],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          {
            programs: [stubProgram],
            fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
          }
        )
      );

      await screen.findByTestId("create-round-small-link");
    });
  });
});
