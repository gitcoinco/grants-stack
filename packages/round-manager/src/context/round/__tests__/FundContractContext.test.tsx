import { faker } from "@faker-js/faker";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  approveTokenOnContract,
  fundRoundContract,
} from "../../../features/api/application";
import { waitForSubgraphSyncTo } from "../../../features/api/subgraph";
import { ProgressStatus } from "../../../features/api/types";
import {
  FundContractParams,
  FundContractProvider,
  useFundContract,
} from "../FundContractContext";

jest.mock("wagmi");
jest.mock("../../../features/api/subgraph");
jest.mock("../../../features/api/application");

const mockSigner = {
  getChainId: () => {
    /* do nothing.*/
  },
};
jest.mock("wagmi", () => ({
  useSigner: () => ({ data: mockSigner }),
}));

const testParams: FundContractParams = {
  roundId: "testRoundId",
  fundAmount: 100,
  payoutToken: {
    name: "Test Token",
    decimal: 18,
    address: "0x1234567890123456789012345678901234567890",
    chainId: 1,
  },
};

describe("<FundContractProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (fundRoundContract as jest.Mock).mockReturnValue(
      new Promise(() => {
        /* do nothing.*/
      }),
    );
  });

  it("renders without crashing", () => {
    renderWithProvider(<TestUseFundContractComponent {...testParams} />);
  });

  it("updates progress statuses after fundContract is called", async () => {
    renderWithProvider(<TestUseFundContractComponent {...testParams} />);

    const fundContractButton = screen.getByTestId("fund-contract");
    fireEvent.click(fundContractButton);

    await waitFor(() => {
      expect(
        screen.getByTestId(
          `token-approval-status-is-${ProgressStatus.IS_SUCCESS}`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`fund-status-is-${ProgressStatus.NOT_STARTED}`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`indexing-status-is-${ProgressStatus.NOT_STARTED}`),
      ).toBeInTheDocument();
    });
  });
});

describe("useFundContract Errors", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing.*/
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("sets fund status to error when invoking fund fails", async () => {
    (fundRoundContract as jest.Mock).mockRejectedValue(new Error(":("));

    renderWithProvider(<TestUseFundContractComponent {...testParams} />);

    fireEvent.click(screen.getByTestId("fund-contract"));

    expect(
      await screen.findByTestId(`fund-status-is-${ProgressStatus.IS_ERROR}`),
    ).toBeInTheDocument();
  });

  it("sets indexing status to error when indexing fails", async () => {
    (approveTokenOnContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: faker.random.numeric(),
    });
    (fundRoundContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: faker.random.numeric(),
    });
    (waitForSubgraphSyncTo as jest.Mock).mockRejectedValue(new Error(":("));

    renderWithProvider(<TestUseFundContractComponent {...testParams} />);

    fireEvent.click(screen.getByTestId("fund-contract"));

    expect(
      await screen.findByTestId(
        `indexing-status-is-${ProgressStatus.IS_ERROR}`,
      ),
    ).toBeInTheDocument();
  });

  it("if fund fails, resets fund status when fund contract is retried", async () => {
    (approveTokenOnContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: faker.random.numeric(),
    });
    (fundRoundContract as jest.Mock)
      .mockRejectedValueOnce(new Error(":("))
      .mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        }),
      );

    renderWithProvider(<TestUseFundContractComponent {...testParams} />);
    fireEvent.click(screen.getByTestId("fund-contract"));

    // retry bulk update operation
    await screen.findByTestId(`fund-status-is-${ProgressStatus.IS_ERROR}`);
    fireEvent.click(screen.getByTestId("fund-contract"));

    expect(
      screen.queryByTestId(`fund-status-is-${ProgressStatus.IS_ERROR}`),
    ).not.toBeInTheDocument();
  });

  it("if indexing fails, resets indexing status when fund contract is retried", async () => {
    (approveTokenOnContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: faker.random.numeric(),
    });
    (fundRoundContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: faker.random.numeric(),
    });
    (waitForSubgraphSyncTo as jest.Mock)
      .mockRejectedValueOnce(new Error(":("))
      .mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        }),
      );

    renderWithProvider(<TestUseFundContractComponent {...testParams} />);
    fireEvent.click(screen.getByTestId("fund-contract"));

    // retry bulk update operation
    await screen.findByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`);
    fireEvent.click(screen.getByTestId("fund-contract"));

    expect(
      screen.queryByTestId(`indexing-status-is-${ProgressStatus.IS_ERROR}`),
    ).not.toBeInTheDocument();
  });
});

const TestUseFundContractComponent = (params: FundContractParams) => {
  const { tokenApprovalStatus, fundStatus, indexingStatus, fundContract } =
    useFundContract();

  return (
    <>
      <div data-testid={`token-approval-status-is-${tokenApprovalStatus}`}>
        {tokenApprovalStatus}
      </div>
      <div data-testid={`fund-status-is-${fundStatus}`}>{fundStatus}</div>
      <div data-testid={`indexing-status-is-${indexingStatus}`}>
        {indexingStatus}
      </div>
      <button
        data-testid="fund-contract"
        onClick={() => {
          fundContract(params);
        }}
      />
    </>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<FundContractProvider>{ui}</FundContractProvider>);
}
