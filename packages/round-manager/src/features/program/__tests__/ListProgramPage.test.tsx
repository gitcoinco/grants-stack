import ListProgramPage from "../ListProgramPage";
import { screen } from "@testing-library/react";
import { makeProgramData, renderWithContext } from "../../../test-utils";

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

describe("<ListProgramPage />", () => {
  it("does not render a list of programs when no programs have been created", () => {
    renderWithContext(<ListProgramPage />, { programs: [], isLoading: false });

    expect(screen.queryAllByTestId("program-card")).toHaveLength(0);
  });

  it("renders a list of programs when programs have been created", async () => {
    renderWithContext(<ListProgramPage />, {
      programs: [makeProgramData(), makeProgramData()],
      isLoading: false,
    });

    expect(await screen.findAllByTestId("program-card")).toHaveLength(2);
  });

  it("shows loading while fetching list of programs", async () => {
    renderWithContext(<ListProgramPage />, { isLoading: true, programs: [] });

    screen.getByTestId("loading-spinner");
  });
});
