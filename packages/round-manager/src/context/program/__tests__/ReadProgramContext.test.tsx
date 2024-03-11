import { render, screen } from "@testing-library/react";
import { getProgramById, listPrograms } from "../../../features/api/program";
import { Program, ProgressStatus } from "../../../features/api/types";
import { makeProgramData } from "../../../test-utils";
import {
  ReadProgramProvider,
  useProgramById,
  usePrograms,
} from "../ReadProgramContext";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

jest.mock("../../../features/api/program");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
    getProgramsByUser: jest.fn(),
  }),
}));

describe("<ReadProgramProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("usePrograms()", () => {
    it("sets program status to in progress when fetch is in progress", async () => {
      const listProgramsPromise = new Promise(() => {
        /**/
      });

      (listPrograms as jest.Mock).mockReturnValue(listProgramsPromise);

      renderWithProvider(<TestingUseProgramsComponent />);

      expect(
        await screen.findByTestId(
          `program-fetching-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets programs when fetch succeeds", async () => {
      (listPrograms as jest.Mock).mockResolvedValue([makeProgramData()]);

      renderWithProvider(<TestingUseProgramsComponent />);

      expect(await screen.findAllByTestId("program")).toHaveLength(1);

      expect(
        await screen.findByTestId(
          `program-fetching-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets fetch program error state when fetch fails", async () => {
      (listPrograms as jest.Mock).mockRejectedValue(Error("some error"));

      renderWithProvider(<TestingUseProgramsComponent />);

      expect(
        await screen.findByTestId(
          `program-fetching-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();

      screen.getByTestId("error-msg");
    });

    it("propagates error state when failing to list programs", async () => {
      (listPrograms as jest.Mock).mockRejectedValue(
        Error("some error message text")
      );

      renderWithProvider(<TestingUseProgramsComponent />);

      await screen.findByTestId("error-msg");
    });
  });

  describe("useProgramById()", () => {
    it("provides programs based on given program id", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId = expectedProgram.id;
      (getProgramById as jest.Mock).mockResolvedValue(expectedProgram);

      renderWithProvider(
        <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
      );

      expect(await screen.findByText(expectedProgramId!)).toBeInTheDocument();
    });

    it("sets program status to in progress when fetch is in progress", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId = expectedProgram.id;
      (getProgramById as jest.Mock).mockReturnValue(
        new Promise<Program>(() => {
          /* do nothing.*/
        })
      );

      renderWithProvider(
        <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
      );

      expect(
        await screen.findByTestId(
          `fetch-programs-status-is-${ProgressStatus.IN_PROGRESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets programs when fetch succeeds", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId = expectedProgram.id;
      (getProgramById as jest.Mock).mockResolvedValue(expectedProgram);

      renderWithProvider(
        <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
      );

      expect(await screen.findByText(expectedProgramId!)).toBeInTheDocument();

      expect(
        await screen.findByTestId(
          `fetch-programs-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
    });

    it("sets fetch program error state when fetch fails", async () => {
      const expectedProgram = makeProgramData();
      const expectedProgramId = expectedProgram.id;
      (getProgramById as jest.Mock).mockRejectedValue(new Error(":("));

      renderWithProvider(
        <TestingUseProgramByIdComponent expectedProgramId={expectedProgramId} />
      );

      expect(
        await screen.findByTestId(
          `fetch-programs-status-is-${ProgressStatus.IS_ERROR}`
        )
      ).toBeInTheDocument();

      screen.getByTestId("program-by-id-error-msg");
    });
  });
});
//TODO: change test id to fetch-programs-status-is
const TestingUseProgramsComponent = () => {
  const { programs, listProgramsError, fetchProgramsStatus } = usePrograms();

  return (
    <>
      <div>
        {programs.map((it, index) => (
          <div data-testid="program" key={index} />
        ))}
      </div>

      <div data-testid={`program-fetching-status-is-${fetchProgramsStatus}`} />

      {listProgramsError && <div data-testid="error-msg" />}

      {fetchProgramsStatus && <div data-testid="is-loading" />}
    </>
  );
};

const TestingUseProgramByIdComponent = (props: {
  expectedProgramId?: string;
}) => {
  const { program, fetchProgramsStatus, getProgramByIdError } = useProgramById(
    props.expectedProgramId
  );
  return (
    <>
      {program ? <div>{program.id}</div> : <div>No Program Found</div>}

      {fetchProgramsStatus && (
        <div data-testid="is-loading-program-by-id"></div>
      )}
      <div
        data-testid={`fetch-programs-status-is-${fetchProgramsStatus}`}
      ></div>

      {getProgramByIdError && <div data-testid="program-by-id-error-msg" />}
    </>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<ReadProgramProvider>{ui}</ReadProgramProvider>);
}
