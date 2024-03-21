import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProgressStatus } from "../../../features/api/types";
import {
  ReclaimFundsParams,
  ReclaimFundsProvider,
  useReclaimFunds,
} from "../ReclaimFundsContext";
import { error, success } from "common/dist/allo/common";
import { AlloV1, createMockTransactionSender, AlloOperation } from "common";

jest.mock("wagmi");
jest.mock("../../../features/api/payoutStrategy/payoutStrategy");

jest.mock("viem", () => ({
  getAddress: jest.fn(),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

const mockSigner = {
  getChainId: () => {
    /* do nothing.*/
  },
};
jest.mock("wagmi", () => ({
  useSigner: () => ({ data: mockSigner }),
}));

const alloBackend = new AlloV1({
  chainId: 1,
  ipfsUploader: async () =>
    Promise.resolve({
      type: "success",
      value: "ipfsHash",
    }),
  waitUntilIndexerSynced: jest.fn(),
  transactionSender: createMockTransactionSender(),
});

const testParams: ReclaimFundsParams = {
  allo: alloBackend,
  payoutStrategy: "0x0000000000000000000000000000000000000001",
  token: "0x0000000000000000000000000000000000000002",
  recipient: "0x0000000000000000000000000000000000000003",
};

describe("<ReclaimFundsProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    alloBackend.withdrawFundsFromStrategy = jest.fn().mockImplementation(() => {
      return new AlloOperation(async () => {
        return success(null);
      });
    });
  });

  it("renders without crashing", () => {
    renderWithProvider(<TestUseReclaimFundsComponent {...testParams} />);
  });

  it("updates progress statuses after reclaim contract is called", async () => {
    renderWithProvider(<TestUseReclaimFundsComponent {...testParams} />);

    const reclaimFundsButton = screen.getByTestId("reclaim-funds");
    fireEvent.click(reclaimFundsButton);

    await waitFor(() => {
      expect(
        screen.getByTestId(`reclaim-status-is-${ProgressStatus.IN_PROGRESS}`)
      ).toBeInTheDocument();
    });
  });
});

describe("useReclaimFunds Errors", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing.*/
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("sets reclaim status to error when invoking fund fails", async () => {
    alloBackend.withdrawFundsFromStrategy = jest.fn().mockImplementation(() => {
      return new AlloOperation(async () => {
        return error(new Error("test error"));
      });
    });

    renderWithProvider(<TestUseReclaimFundsComponent {...testParams} />);

    fireEvent.click(screen.getByTestId("reclaim-funds"));

    expect(
      await screen.findByTestId(`reclaim-status-is-${ProgressStatus.IS_ERROR}`)
    ).toBeInTheDocument();
  });

  it("if reclaim fails, resets reclaim status when reclaim contract is retried", async () => {
    alloBackend.withdrawFundsFromStrategy = jest.fn().mockImplementation(() => {
      return new AlloOperation(async () => {
        return error(new Error("test error"));
      });
    });

    renderWithProvider(<TestUseReclaimFundsComponent {...testParams} />);
    fireEvent.click(screen.getByTestId("reclaim-funds"));

    await screen.findByTestId(`reclaim-status-is-${ProgressStatus.IS_ERROR}`);
    fireEvent.click(screen.getByTestId("reclaim-funds"));

    expect(
      screen.queryByTestId(`reclaim-status-is-${ProgressStatus.IS_ERROR}`)
    ).not.toBeInTheDocument();
  });
});

const TestUseReclaimFundsComponent = (params: ReclaimFundsParams) => {
  const { reclaimStatus, reclaimFunds } = useReclaimFunds();

  return (
    <>
      <div data-testid={`reclaim-status-is-${reclaimStatus}`}>
        {reclaimStatus}
      </div>
      <button
        data-testid="reclaim-funds"
        onClick={() => {
          reclaimFunds(params);
        }}
      />
    </>
  );
};

function renderWithProvider(ui: JSX.Element) {
  render(<ReclaimFundsProvider>{ui}</ReclaimFundsProvider>);
}
