import ViewProgram from "../ViewProgramPage";
import { render, screen } from "@testing-library/react";
import {
  makeProgramData,
  makeRoundData,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { Program, ProgressStatus } from "../../api/types";
import { formatUTCDateAsISOString } from "common";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";

const programId = faker.number.int().toString();

jest.mock("../../common/Navbar");
jest.mock("../../api/program");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useNetwork: jest.fn(),
  useChainId: jest.fn(),
  useAccount: jest.fn(),
}));

describe("<ViewProgram />", () => {
  let stubProgram: Program;

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({
      id: programId,
    });

    stubProgram = makeProgramData({ id: programId });

    (useAccount as jest.Mock).mockReturnValue({
      address: stubProgram.operatorWallets[0],
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
    (useAccount as jest.Mock).mockReturnValue({
      address: faker.finance.ethereumAddress(),
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
    (useAccount as jest.Mock).mockReturnValue({
      address: stubProgram.operatorWallets[0],
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
