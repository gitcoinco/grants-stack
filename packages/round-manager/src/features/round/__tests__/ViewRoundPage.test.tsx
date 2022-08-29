import { fireEvent, screen } from "@testing-library/react"
import { useWallet } from "../../common/Auth"
import { useListRoundsQuery } from "../../api/services/round"
import ViewRoundPage from "../ViewRoundPage"
import { GrantApplication, Round } from "../../api/types"
import { makeGrantApplicationData, makeRoundData, renderWrapped } from "../../../test-utils"
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery
} from "../../api/services/grantApplication"
import { useDisconnect, useSwitchNetwork } from "wagmi"

jest.mock("../../common/Auth");
jest.mock("../../api/services/round");
jest.mock("../../api/services/grantApplication");
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}))

const mockRoundData: Round = makeRoundData();
const mockApplicationData: GrantApplication[] = [];

describe('the view round page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useWallet as jest.Mock).mockReturnValue({ chain: {}, address: mockRoundData.operatorWallets[0] });

    (useListRoundsQuery as jest.Mock).mockReturnValue({
      round: mockRoundData,
      isLoading: false,
      isSuccess: true
    });

    (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
      data: mockApplicationData,
      refetch: jest.fn(),
      isLoading: false,
      isSuccess: true
    });

    (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        isLoading: false
      }
    ]);

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  })

  it("should display 404 when there no round is found", () => {
    (useListRoundsQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true
    });

    renderWrapped(<ViewRoundPage />);
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  })

  it("should display access denied when wallet accessing is not program operator", () => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });

    renderWrapped(<ViewRoundPage />);
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  })

  it("should display copy when there are no applicants for a given round", () => {
    renderWrapped(<ViewRoundPage />);
    expect(screen.getByText("No Applications")).toBeInTheDocument();
  })

  it("should indicate how many of each kind of application there are", () => {
    const mockApplicationData: GrantApplication[] = [
      makeGrantApplicationData({ status: "PENDING" }),
      makeGrantApplicationData({ status: "PENDING" }),
      makeGrantApplicationData({ status: "REJECTED" }),
      makeGrantApplicationData({ status: "APPROVED" }),
    ];
    (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
      data: mockApplicationData,
      isLoading: false,
      isSuccess: true
    });

    renderWrapped(<ViewRoundPage />);

    expect(parseInt(screen.getByTestId('received-application-counter').textContent!!)).toBe(2)
    expect(parseInt(screen.getByTestId('rejected-application-counter').textContent!!)).toBe(1)
    expect(parseInt(screen.getByTestId('approved-application-counter').textContent!!)).toBe(1)
  })

  describe("when there are received applications", () => {
    beforeEach(() => {
      const mockApplicationData: GrantApplication[] = [
        makeGrantApplicationData({ status: "PENDING" }),
        makeGrantApplicationData({ status: "PENDING" }),
        makeGrantApplicationData({ status: "REJECTED" }),
        makeGrantApplicationData({ status: "APPROVED" }),
      ];
      (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
        data: mockApplicationData,
        isLoading: false,
        isSuccess: true
      })
    })

    it("should display the bulk select button", () => {
      renderWrapped(<ViewRoundPage />)
      expect(screen.getByText(
        'Save in gas fees by approving/rejecting multiple applications at once.'
      )).toBeInTheDocument()
      expect(screen.getByRole('button', {
        name: /Select/i
      })).toBeInTheDocument()
    });

    it("should display the cancel button when select is clicked", () => {
      renderWrapped(<ViewRoundPage />)
      const selectButton = screen.getByRole('button', {
        name: /Select/i
      });
      fireEvent.click(selectButton)
      expect(screen.getByRole('button', {
        name: /Cancel/i
      })).toBeInTheDocument()
      expect(screen.queryByRole('button', {
        name: /Select/i
      })).not.toBeInTheDocument()
    });

    it("should display the select button when cancel is clicked", () => {
      renderWrapped(<ViewRoundPage />)
      const selectButton = screen.getByRole('button', {
        name: /Select/i
      });
      fireEvent.click(selectButton)

      const cancelButton = screen.getByRole('button', {
        name: /Cancel/i
      });
      fireEvent.click(cancelButton)

      expect(screen.queryByRole('button', {
        name: /Cancel/i
      })).not.toBeInTheDocument()
      expect(screen.getByRole('button', {
        name: /Select/i
      })).toBeInTheDocument()
    });
  });

  describe("when there are no received applications", () => {
    it("should not display the bulk select button", () => {
      const mockApplicationData: GrantApplication[] = [
        makeGrantApplicationData({ status: "REJECTED" }),
        makeGrantApplicationData({ status: "APPROVED" }),
      ];
      (useListGrantApplicationsQuery as jest.Mock).mockReturnValue({
        data: mockApplicationData,
        isLoading: false,
        isSuccess: true
      })
      renderWrapped(<ViewRoundPage />)

      expect(screen.queryByText(
        'Save in gas fees by approving/rejecting multiple applications at once.'
      )).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {
        name: /Select/i
      })).not.toBeInTheDocument()
    });
  });
})
