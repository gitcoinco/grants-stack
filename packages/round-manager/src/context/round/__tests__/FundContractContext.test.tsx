import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import {
  FundContractParams,
  FundContractProvider,
  useFundContract,
} from "../FundContractContext";

jest.mock("wagmi");
jest.mock("../../../features/api/subgraph");
jest.mock("../../../features/api/application", () => {
  return {
    fundRoundContract: async () => {
      return {
        txBlockNumber: 1234,
        txHash: "0xabcdef1234567890",
      };
    },
  };
});

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
          `token-approval-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`fund-status-is-${ProgressStatus.NOT_STARTED}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`indexing-status-is-${ProgressStatus.NOT_STARTED}`)
      ).toBeInTheDocument();
    });
  });

  it("updates token approval status after fundContract is successful", async () => {
    renderWithProvider(<TestUseFundContractComponent {...testParams} />);

    const fundContractButton = screen.getByTestId("fund-contract");
    fireEvent.click(fundContractButton);

    await waitFor(() => {
      expect(
        screen.getByTestId(
          `token-approval-status-is-${ProgressStatus.IS_SUCCESS}`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`fund-status-is-${ProgressStatus.IS_SUCCESS}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`indexing-status-is-${ProgressStatus.IS_SUCCESS}`)
      ).toBeInTheDocument();
    });
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
