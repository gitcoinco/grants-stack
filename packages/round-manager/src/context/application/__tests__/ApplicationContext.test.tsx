/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApplicationProvider,
  useApplicationById,
  useApplicationByRoundId,
} from "../ApplicationContext";
import { render, screen, waitFor } from "@testing-library/react";
import { makeGrantApplicationData } from "../../../test-utils";
import { GrantApplication } from "../../../features/api/types";
import {
  getApplicationById,
  getApplicationsByRoundId,
} from "../../../features/api/application";

const mockWallet = { address: "0x0", provider: {} };

jest.mock("../../../features/api/application");
jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("<ApplicationProvider />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("useApplicationById()", () => {
    it("provides application based on given application id", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedApplicationId: string = expectedApplication.id;
      (getApplicationById as jest.Mock).mockResolvedValue(expectedApplication);

      render(
        <ApplicationProvider>
          <TestingUseApplicationByIdComponent
            expectedApplicationId={expectedApplicationId}
          />
        </ApplicationProvider>
      );

      expect(
        await screen.findByText(expectedApplicationId)
      ).toBeInTheDocument();
    });

    it("sets isLoading to true when getApplicationById call is in progress", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedApplicationId: string = expectedApplication.id;
      (getApplicationById as any).mockReturnValue(
        new Promise<GrantApplication>(() => {
          /* do nothing.*/
        })
      );

      render(
        <ApplicationProvider>
          <TestingUseApplicationByIdComponent
            expectedApplicationId={expectedApplicationId}
          />
        </ApplicationProvider>
      );

      expect(
        await screen.findByTestId("is-loading-application-by-id")
      ).toBeInTheDocument();
    });

    it("sets isLoading back to false and when getApplicationById call succeeds", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedApplicationId: string = expectedApplication.id;
      (getApplicationById as jest.Mock).mockResolvedValue(
        Promise.resolve(expectedApplication)
      );

      render(
        <ApplicationProvider>
          <TestingUseApplicationByIdComponent
            expectedApplicationId={expectedApplicationId}
          />
        </ApplicationProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-application-by-id")
        ).not.toBeInTheDocument();
      });
    });

    it("sets isLoading back to false when getApplicationById call fails", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedApplicationId: string = expectedApplication.id;
      (getApplicationById as any).mockRejectedValue(new Error(":("));

      render(
        <ApplicationProvider>
          <TestingUseApplicationByIdComponent
            expectedApplicationId={expectedApplicationId}
          />
        </ApplicationProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-application-by-id")
        ).not.toBeInTheDocument();
      });

      screen.getByTestId("application-by-id-error-msg");
    });
  });

  describe("useApplicationByRoundId()", () => {
    it("provides applications based on given round id", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedRoundId: string = expectedApplication.round;

      (getApplicationsByRoundId as any).mockResolvedValue([
        expectedApplication,
      ]);

      render(
        <ApplicationProvider>
          <TestingUseApplicationByRoundIdComponent
            expectedRoundId={expectedRoundId}
          />
        </ApplicationProvider>
      );

      expect(await screen.findByText(expectedRoundId)).toBeInTheDocument();
    });

    it("sets isLoading to true when getApplicationsByRoundId call is in progress", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedRoundId: string = expectedApplication.round;

      (getApplicationsByRoundId as any).mockReturnValue(
        new Promise<GrantApplication>(() => {
          /* do nothing.*/
        })
      );

      render(
        <ApplicationProvider>
          <TestingUseApplicationByRoundIdComponent
            expectedRoundId={expectedRoundId}
          />
        </ApplicationProvider>
      );

      expect(
        await screen.findByTestId("is-loading-application-by-round-id")
      ).toBeInTheDocument();
    });

    it("sets isLoading back to false and when getApplicationsByRoundId call succeeds", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedRoundId: string = expectedApplication.round;

      (getApplicationsByRoundId as any).mockResolvedValue([
        expectedApplication,
      ]);

      render(
        <ApplicationProvider>
          <TestingUseApplicationByRoundIdComponent
            expectedRoundId={expectedRoundId}
          />
        </ApplicationProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-application-by-round-id")
        ).not.toBeInTheDocument();
      });
    });

    it("sets isLoading back to false when getApplicationsByRoundId call fails", async () => {
      const expectedApplication = makeGrantApplicationData();
      const expectedRoundId: string = expectedApplication.round;

      (getApplicationsByRoundId as any).mockRejectedValue(new Error(":("));

      render(
        <ApplicationProvider>
          <TestingUseApplicationByRoundIdComponent
            expectedRoundId={expectedRoundId}
          />
        </ApplicationProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("is-loading-application-by-round-id")
        ).not.toBeInTheDocument();
      });

      screen.getByTestId("application-by-round-id-error-msg");
    });
  });
});

const TestingUseApplicationByIdComponent = (props: {
  expectedApplicationId: string;
}) => {
  const { application, isLoading, getApplicationByIdError } =
    useApplicationById(props.expectedApplicationId);

  return (
    <>
      {application ? (
        <div>{application.id}</div>
      ) : (
        <div>No Applications Found</div>
      )}

      {isLoading && <div data-testid="is-loading-application-by-id"></div>}

      {getApplicationByIdError && (
        <div data-testid="application-by-id-error-msg" />
      )}
    </>
  );
};

const TestingUseApplicationByRoundIdComponent = (props: {
  expectedRoundId: string;
}) => {
  const { applications, isLoading, getApplicationByRoundIdError } =
    useApplicationByRoundId(props.expectedRoundId);

  return (
    <>
      {applications?.map((application, index) => (
        <div data-testid="round-application" key={index}>
          {application.round}
        </div>
      ))}

      {!applications ||
        (applications.length == 0 && <div>No Applications Found</div>)}

      {isLoading && (
        <div data-testid="is-loading-application-by-round-id"></div>
      )}

      {getApplicationByRoundIdError && (
        <div data-testid="application-by-round-id-error-msg" />
      )}
    </>
  );
};
