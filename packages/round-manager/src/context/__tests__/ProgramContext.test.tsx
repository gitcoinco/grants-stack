/* eslint-disable @typescript-eslint/no-explicit-any */
import { useProgramById, ProgramProvider, usePrograms } from "../ProgramContext";
import { render, screen, waitFor } from "@testing-library/react";
import { makeProgramData } from "../../test-utils";
import { getProgramById, listPrograms } from "../../features/api/program";
import { Program } from "../../features/api/types"

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

  describe("usePrograms()", () => {
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

    it("sets isLoading back to false and error when listPrograms call fails", async () => {
      (listPrograms as any).mockRejectedValue(Error("some error"));
      renderWithProvider();

      await waitFor(() => {
        expect(screen.queryByTestId("is-loading")).not.toBeInTheDocument();
      });

      screen.getByTestId("error-msg");
    });

    it("sets isLoading to true when listPrograms call is in progress", async () => {
      const listProgramsPromise = new Promise(() => {
      /**/
    });

      (listPrograms as any).mockReturnValue(listProgramsPromise);
      renderWithProvider();

      await screen.findByTestId("is-loading");
    });
  })

  describe("useProgramById()", () => {
    it("provides programs based on given program id", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId: string = expectedProgram.id!;
      (getProgramById as any).mockResolvedValue(expectedProgram);

      render(
        <ProgramProvider>
          <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
        </ProgramProvider>
      )

      expect(await screen.findByText(expectedProgramId)).toBeInTheDocument()
    })

    it("sets isLoading to true when getProgramById call is in progress", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId: string = expectedProgram.id!;
      (getProgramById as any).mockReturnValue(new Promise<Program>(() => {}));

      render(
        <ProgramProvider>
          <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
        </ProgramProvider>
      )

      expect(await screen.findByTestId("is-loading-program-by-id")).toBeInTheDocument();
    })

    it("sets isLoading back to false and when getProgramById call succeeds", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId: string = expectedProgram.id!;
      (getProgramById as any).mockResolvedValue(expectedProgram);

      render(
        <ProgramProvider>
          <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
        </ProgramProvider>
      )

      await waitFor(() => {
        expect(screen.queryByTestId("is-loading-program-by-id")).not.toBeInTheDocument();
      })
    })

    it("sets isLoading back to false when getProgramById call fails", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId: string = expectedProgram.id!;
      (getProgramById as any).mockRejectedValue(new Error(":("));

      render(
        <ProgramProvider>
          <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
        </ProgramProvider>
      )

      await waitFor(() => {
        expect(screen.queryByTestId("is-loading-program-by-id")).not.toBeInTheDocument();
      })

      screen.getByTestId("program-by-id-error-msg");
    })
  })
});

const TestingUseProgramsComponent = () => {
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

const TestingUseProgramByIdComponent = (props: {
  expectedProgramId?: string
}) => {
  const { program, isLoading, getProgramByIdError } = useProgramById(props.expectedProgramId)
  return (
    <>
      {program ?
        <div>{program.id}</div>
        : <div>No Program Found</div>}

      {isLoading &&
        <div data-testid="is-loading-program-by-id"></div>
      }

      { getProgramByIdError &&
        <div data-testid="program-by-id-error-msg" />
      }
    </>
  )
}
function renderWithProvider() {
  render(
    <ProgramProvider>
      <TestingUseProgramsComponent></TestingUseProgramsComponent>
    </ProgramProvider>
  );
}
