import ListProgramPage from "../ListProgramPage";
import { screen } from "@testing-library/react";
import { makeProgramData, renderWithContext } from "../../../test-utils";

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {} }),
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("<ListProgramPage />", () => {
  it("does not render a list of programs when no programs have been created", () => {
    renderWithContext(<ListProgramPage />, { programs: [] });

    expect(screen.queryAllByTestId("program-card")).toHaveLength(0);
  });

  it("renders a list of programs when programs have been created", async () => {
    renderWithContext(<ListProgramPage />, {
      programs: [makeProgramData(), makeProgramData()],
    });

    expect(await screen.findAllByTestId("program-card")).toHaveLength(2);
  });

  it("shows loading while fetching list of programs", async () => {
    renderWithContext(<ListProgramPage />, { isLoading: true, programs: [] });

    screen.getByText("Fetching Programs");
  });
});
