import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { reclaimFundsFromContract } from "../../../features/api/payoutStrategy/payoutStrategy";
import { ProgressStatus } from "../../../features/api/types";
import {
  ReclaimFundsParams,
  ReclaimFundsProvider,
  useReclaimFunds,
} from "../ReclaimFundsContext";

jest.mock("wagmi");
jest.mock("../../../features/api/payoutStrategy/payoutStrategy");

const mockSigner = {
  getChainId: () => {
    /* do nothing.*/
  },
};
jest.mock("wagmi", () => ({
  useSigner: () => ({ data: mockSigner }),
}));

const testParams: ReclaimFundsParams = {
  payoutStrategy: "testPayoutStrategy",
  recipientAddress: "0x1234567890123456789012345678901234567890",
};

describe("<ReclaimFundsProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (reclaimFundsFromContract as jest.Mock).mockReturnValue(
      new Promise(() => {
        /* do nothing.*/
      })
    );
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
    (reclaimFundsFromContract as jest.Mock).mockRejectedValue(new Error(":("));

    renderWithProvider(<TestUseReclaimFundsComponent {...testParams} />);

    fireEvent.click(screen.getByTestId("reclaim-funds"));

    expect(
      await screen.findByTestId(`reclaim-status-is-${ProgressStatus.IS_ERROR}`)
    ).toBeInTheDocument();
  });

  it("if reclaim fails, resets reclaim status when reclaim contract is retried", async () => {
    (reclaimFundsFromContract as jest.Mock)
      .mockRejectedValueOnce(new Error(":("))
      .mockReturnValue(
        new Promise(() => {
          /* do nothing.*/
        })
      );

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
