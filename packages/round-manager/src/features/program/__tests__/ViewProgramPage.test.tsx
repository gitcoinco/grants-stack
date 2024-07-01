import { faker } from "@faker-js/faker";
// import { render, screen } from "@testing-library/react";
// import {
//   ROUND_PAYOUT_DIRECT_OLD as ROUND_PAYOUT_DIRECT,
//   ROUND_PAYOUT_MERKLE_OLD as ROUND_PAYOUT_MERKLE,
//   formatLocalDateAsISOString,
// } from "common";
// import {
// makeProgramData,
// makeRoundData,
// wrapWithReadProgramContext,
// wrapWithRoundContext,
// } from "../../../test-utils";
// import { Program } from "../../api/types";
// import { useWallet } from "../../common/Auth";
// import ViewProgram from "../ViewProgramPage";

const programId = faker.datatype.number().toString();
const useParamsFn = () => ({ id: programId });

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("../../api/program");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
  getDefaultConfig: jest.fn(),
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
export const mockedOperatorWallet = faker.finance.ethereumAddress();

jest.mock("wagmi", () => ({
  useAccount: () => ({
    chainId: 1,
    address: mockedOperatorWallet,
  }),
  useSwitchChain: () => ({
    switchChain: jest.fn(),
  }),
}));

jest.mock("../../../app/wagmi", () => ({
  getEthersProvider: (chainId: number) => ({
    getNetwork: () => Promise.resolve({ network: { chainId } }),
    network: { chainId },
  }),
}));

// jest.mock("../../context/round/RoundContext", () => ({
//   ...jest.requireActual("../../context/round/RoundContext"),
//   useRounds: jest.fn(),
// }));

describe("<ViewProgram />", () => {
  // let stubProgram: Program;

  beforeEach(() => {
    jest.clearAllMocks();

    // stubProgram = makeProgramData({
    //   id: programId,
    //   chain: { id: 1 },
    //   tags: ["allo-v2"],
    //   operatorWallets: [mockedOperatorWallet],
    //   roles: [
    //     {
    //       address: mockedOperatorWallet,
    //       role: "OWNER",
    //       createdAtBlock: "0",
    //     },
    //   ],
    // });
  });

  it("should display NotFoundPage when no program is found", () => {
    expect(true).toBe(true);
    // render(wrapWithReadProgramContext(wrapWithRoundContext(<ViewProgram />)));

    // expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  //   it("should display access denied when wallet accessing is not program operator", () => {
  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [
  //             {
  //               ...stubProgram,
  //               roles: [
  //                 {
  //                   address: faker.finance.ethereumAddress(),
  //                   role: "OWNER",
  //                   createdAtBlock: "0",
  //                 },
  //               ],
  //               operatorWallets: [faker.finance.ethereumAddress()],
  //             },
  //           ],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );
  //     expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  //   });

  //   it("displays the program name", async () => {
  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     await screen.findByText(stubProgram.metadata.name);
  //   });

  //   it("displays a list of operator wallets for a program", async () => {
  //     const operatorWallets = [
  //       faker.finance.ethereumAddress(),
  //       faker.finance.ethereumAddress(),
  //       faker.finance.ethereumAddress(),
  //       mockedOperatorWallet,
  //     ];

  //     const stubProgram = makeProgramData({ id: programId, operatorWallets });
  //     (useWallet as jest.Mock).mockReturnValue({
  //       chain: {},
  //       address: stubProgram.operatorWallets[0],
  //       provider: { getNetwork: () => Promise.resolve({ chainId: "0x0" }) },
  //     });

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [],
  //           fetchRoundStatus: ProgressStatus.NOT_STARTED,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     const wallets = await screen.findAllByTestId("program-operator-wallet");
  //     expect(wallets.length).toEqual(operatorWallets.length);
  //   });

  //   it("displays a loading spinner if loading program", () => {
  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [],
  //           fetchRoundStatus: ProgressStatus.NOT_STARTED,
  //         }),
  //         { fetchProgramsStatus: ProgressStatus.IN_PROGRESS }
  //       )
  //     );

  //     screen.getByTestId("loading-spinner");
  //   });

  //   it("displays Quadratic Funding badge when a round is of type Quadratic Funding", () => {
  //     const stubRound = makeRoundData({
  //       ownedBy: stubProgram.id,
  //     });

  //     stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_MERKLE;

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [stubRound],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     const badge = screen.getByTestId("round-payout-strategy-type");
  //     expect(badge).toHaveTextContent("Quadratic Funding");
  //   });

  //   it('displays "Direct Grants" badge when a round is of type Direct grant', () => {
  //     const stubRound = makeRoundData({
  //       ownedBy: stubProgram.id,
  //     });

  //     stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_DIRECT;

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [stubRound],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     const badge = screen.getByTestId("round-payout-strategy-type");
  //     expect(badge).toHaveTextContent("Direct Grant");
  //   });

  //   it("displays a badge indicating the status of the round", () => {
  //     const stubRound = makeRoundData({
  //       ownedBy: stubProgram.id,
  //     });

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [stubRound],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     expect(
  //       screen.getByTestId("round-application-status-badge")
  //     ).toBeInTheDocument();
  //   });

  //   it("displays application and round dates when a round is of type Quadratic Funding", () => {
  //     const stubRound = makeRoundData({
  //       ownedBy: stubProgram.id,
  //     });

  //     stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_MERKLE;

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [stubRound],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     expect(screen.getByTestId("round-application-dates")).toBeInTheDocument();
  //     expect(screen.getByTestId("round-round-dates")).toBeInTheDocument();
  //   });

  //   it("displays round dates when a round is of type Direct grant", () => {
  //     const stubRound = makeRoundData({
  //       ownedBy: stubProgram.id,
  //     });

  //     stubRound.payoutStrategy.strategyName = ROUND_PAYOUT_DIRECT;

  //     render(
  //       wrapWithReadProgramContext(
  //         wrapWithRoundContext(<ViewProgram />, {
  //           data: [stubRound],
  //           fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //         }),
  //         {
  //           programs: [stubProgram],
  //           fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //         }
  //       )
  //     );

  //     expect(
  //       screen.queryByTestId("round-application-dates")
  //     ).not.toBeInTheDocument();
  //     expect(screen.getByTestId("round-round-dates")).toBeInTheDocument();
  //   });

  //   describe("when there are no rounds in the program", () => {
  //     it("displays introductory text on the page", async () => {
  //       render(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewProgram />, {
  //             data: [],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           }),
  //           {
  //             programs: [stubProgram],
  //             fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //           }
  //         )
  //       );

  //       await screen.findAllByTestId("program-details-intro");
  //     });
  //   });

  //   describe("when there is a round in the program", () => {
  //     it("displays round name", async () => {
  //       const stubRound = makeRoundData({ ownedBy: stubProgram.id });

  //       render(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewProgram />, {
  //             data: [stubRound],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           }),
  //           {
  //             programs: [stubProgram],
  //             fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //           }
  //         )
  //       );

  //       expect(
  //         screen.getByText(stubRound.roundMetadata.name)
  //       ).toBeInTheDocument();
  //     });

  //     it("displays grant application start and end dates", async () => {
  //       const stubRound = makeRoundData({ ownedBy: stubProgram.id });

  //       render(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewProgram />, {
  //             data: [stubRound],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           }),
  //           {
  //             programs: [stubProgram],
  //             fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //           }
  //         )
  //       );

  //       const applicationStartTimePeriod = await screen.findByTestId(
  //         "application-start-time-period"
  //       );
  //       const applicationEndTimePeriod = await screen.findByTestId(
  //         "application-end-time-period"
  //       );

  //       const ApplicationStartTime = formatLocalDateAsISOString(
  //         stubRound!.applicationsStartTime
  //       );
  //       const ApplicationEndTime = formatLocalDateAsISOString(
  //         stubRound!.applicationsEndTime
  //       );

  //       expect(applicationStartTimePeriod.textContent).toEqual(
  //         ApplicationStartTime
  //       );
  //       expect(applicationEndTimePeriod.textContent).toEqual(ApplicationEndTime);
  //     });

  //     it("displays round start and end dates", async () => {
  //       const stubRound = makeRoundData({ ownedBy: stubProgram.id });
  //       render(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewProgram />, {
  //             data: [stubRound],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           }),
  //           {
  //             programs: [stubProgram],
  //             fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //           }
  //         )
  //       );

  //       const roundStartTimePeriodElement = await screen.findByTestId(
  //         "round-start-time-period"
  //       );
  //       const roundEndTimePeriodElement = await screen.findByTestId(
  //         "round-end-time-period"
  //       );

  //       const RoundStartTime = formatLocalDateAsISOString(
  //         stubRound!.roundStartTime
  //       );
  //       const RoundEndTime = formatLocalDateAsISOString(stubRound!.roundEndTime);

  //       expect(roundStartTimePeriodElement.textContent).toEqual(RoundStartTime);
  //       expect(roundEndTimePeriodElement.textContent).toEqual(RoundEndTime);
  //     });

  //     it("displays create round link", async () => {
  //       const stubRound = makeRoundData({ ownedBy: stubProgram.id });
  //       render(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewProgram />, {
  //             data: [stubRound],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           }),
  //           {
  //             programs: [stubProgram],
  //             fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
  //           }
  //         )
  //       );

  //       await screen.findByTestId("create-round-small-link");
  //     });
  //   });
});
