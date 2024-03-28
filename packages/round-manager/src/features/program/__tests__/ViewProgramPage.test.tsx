import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react";
import {
  ROUND_PAYOUT_DIRECT_OLD as ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE_OLD as ROUND_PAYOUT_MERKLE,
  formatUTCDateAsISOString,
} from "common";
import {
  makeProgramData,
  makeRoundData,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { Program, ProgressStatus } from "../../api/types";
import { useWallet } from "../../common/Auth";
import ViewProgram from "../ViewProgramPage";

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

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
    getProgramsByUser: jest.fn(),
    fetchRounds: jest.fn(),
  }),
}));

describe("<ViewProgram />", () => {
  let stubProgram: Program;

  beforeEach(() => {
    jest.clearAllMocks();

    stubProgram = makeProgramData({ id: programId, tags: ["allo-v1"] });

    (useWallet as jest.Mock).mockReturnValue({
      chain: {},
      address: stubProgram.operatorWallets[0],
      provider: { getNetwork: () => Promise.resolve({ chainId: "0x0" }) },
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
      provider: { getNetwork: () => Promise.resolve({ chainId: "0x0" }) },
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
      provider: { getNetwork: () => Promise.resolve({ chainId: "0x0" }) },
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

  it("displays Quadratic Funding badge when a round is of type Quadratic Funding", () => {
    const stubRound = makeRoundData({
      ownedBy: stubProgram.id,
    });

    stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_MERKLE;

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

    const badge = screen.getByTestId("round-payout-strategy-type");
    expect(badge).toHaveTextContent("Quadratic Funding");
  });

  it('displays "Direct Grants" badge when a round is of type Direct grant', () => {
    const stubRound = makeRoundData({
      ownedBy: stubProgram.id,
    });

    stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_DIRECT;

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

    const badge = screen.getByTestId("round-payout-strategy-type");
    expect(badge).toHaveTextContent("Direct Grant");
  });

  it("displays a badge indicating the status of the round", () => {
    const stubRound = makeRoundData({
      ownedBy: stubProgram.id,
    });

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
      screen.getByTestId("round-application-status-badge")
    ).toBeInTheDocument();
  });

  it("displays application and round dates when a round is of type Quadratic Funding", () => {
    const stubRound = makeRoundData({
      ownedBy: stubProgram.id,
    });

    stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_MERKLE;

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

    expect(screen.getByTestId("round-application-dates")).toBeInTheDocument();
    expect(screen.getByTestId("round-round-dates")).toBeInTheDocument();
  });

  it("displays round dates when a round is of type Direct grant", () => {
    const stubRound = makeRoundData({
      ownedBy: stubProgram.id,
    });

    stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_DIRECT;

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
      screen.queryByTestId("round-application-dates")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("round-round-dates")).toBeInTheDocument();
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

      const utcApplicationStartTime = formatUTCDateAsISOString(
        stubRound!.applicationsStartTime
      );
      const utcApplicationEndTime = formatUTCDateAsISOString(
        stubRound!.applicationsEndTime
      );

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

      const utcRoundStartTime = formatUTCDateAsISOString(
        stubRound!.roundStartTime
      );
      const utcRoundEndTime = formatUTCDateAsISOString(stubRound!.roundEndTime);

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
