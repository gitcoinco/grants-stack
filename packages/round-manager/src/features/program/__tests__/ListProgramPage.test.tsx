import ListProgramPage from "../ListProgramPage";
import { screen } from "@testing-library/react";
import { makeProgramData, renderWithProgramContext } from "../../../test-utils";
import { ProgressStatus } from "../../api/types";

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: "0x0",
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("data-layer", () => ({
  useDataLayer: () => ({
    getProgramsByUser: jest.fn(),
  }),
}));

describe("<ListProgramPage />", () => {
  it("does not render a list of programs when no programs have been created", () => {
    renderWithProgramContext(<ListProgramPage />, {
      programs: [],
      fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
    });

    expect(screen.queryAllByTestId("program-card")).toHaveLength(0);
  });

  it("renders a list of programs when programs have been created", async () => {
    renderWithProgramContext(<ListProgramPage />, {
      programs: [makeProgramData(), makeProgramData()],
      fetchProgramsStatus: ProgressStatus.IS_SUCCESS,
    });

    expect(await screen.findAllByTestId("program-card")).toHaveLength(2);
  });

  it("shows loading while fetching list of programs", async () => {
    renderWithProgramContext(<ListProgramPage />, {
      fetchProgramsStatus: ProgressStatus.IN_PROGRESS,
      programs: [],
    });

    screen.getByTestId("loading-spinner");
  });
});
