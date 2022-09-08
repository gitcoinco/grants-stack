import { ProgramProvider, usePrograms } from "../ProgramContext";
import { render, screen, waitFor } from "@testing-library/react";
import { makeProgramData } from "../../test-utils";
import { listPrograms } from "../../features/api/program";

const mockWallet = { address: "0x0", provider: {} };

jest.mock("../../features/api/program");
jest.mock("../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("<ListProgramProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("provides programs based on current wallet address", async () => {
    (listPrograms as any).mockResolvedValue([
      makeProgramData(),
      makeProgramData(),
    ]);
    renderWithProvider();

    expect(await screen.findAllByTestId("program")).toHaveLength(2);
  });

  it("propagates error state when failing to list programs", async () => {
    (listPrograms as any).mockRejectedValue(Error("some error message text"));
    renderWithProvider();

    await screen.findByTestId("error-msg");
  });

  it("sets isLoading back to false when listPrograms call succeeds", async () => {
    (listPrograms as any).mockResolvedValue([]);
    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId("is-loading")).not.toBeInTheDocument();
    });
  });

  it("sets isLoading back to false when listPrograms call fails", async () => {
    (listPrograms as any).mockRejectedValue(Error("some error"));
    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId("is-loading")).not.toBeInTheDocument();
    });
  });

  it("sets isLoading to true when listPrograms call is in progress", async () => {
    const listProgramsPromise = new Promise(() => {
      /**/
    });

    (listPrograms as any).mockReturnValue(listProgramsPromise);
    renderWithProvider();

    screen.getByTestId("is-loading");
  });
});

const TestingComponent = () => {
  const { programs, listProgramsError, isLoading } = usePrograms();

  return (
    <>
      <div>
        {programs.map((it, index) => (
          <div data-testid="program" key={index} />
        ))}
      </div>

      {listProgramsError && <div data-testid="error-msg" />}

      {isLoading && <div data-testid="is-loading" />}
    </>
  );
};

function renderWithProvider() {
  render(
    <ProgramProvider>
      <TestingComponent></TestingComponent>
    </ProgramProvider>
  );
}
