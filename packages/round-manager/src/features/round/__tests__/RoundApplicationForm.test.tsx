import { act, fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import { RoundApplicationForm } from "../RoundApplicationForm";
import { useWallet } from "../../common/Auth";

import { useSaveToIPFSMutation } from "../../api/services/ipfs";
import { FormStepper } from "../../common/FormStepper";
import { useCreateRoundMutation } from "../../api/services/round";

jest.mock("../../api/services/ipfs");
jest.mock("../../api/services/program");
jest.mock("../../api/services/round");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("<RoundApplicationForm />", () => {
  let saveToIPFSStub: jest.MockedFn<any>;
  let createRoundStub: () => any;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ chain: {} });
    saveToIPFSStub = jest.fn().mockImplementation(() => ({
      unwrap: async () => Promise.resolve("asdfdsf"),
    }));
    (useSaveToIPFSMutation as jest.Mock).mockReturnValue([
      saveToIPFSStub,
      {
        isError: true,
        isLoading: false,
        isSuccess: false,
      },
    ]);

    createRoundStub = () => ({
      unwrap: async () => Promise.resolve("asdfdsf"),
    });
    (useCreateRoundMutation as jest.Mock).mockReturnValue([
      createRoundStub,
      {
        isError: false,
        isLoading: false,
        isSuccess: false,
      },
    ]);
  });

  it("shows error modal when saving round application meta data fails", async () => {
    renderWrapped(
      <RoundApplicationForm
        initialData={{
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );
    const launch = screen.getByRole("button", { name: /Launch/i });
    await act(() => {
      fireEvent.click(launch);
    });

    expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
  });

  it("choosing done closes the error modal", async () => {
    renderWrapped(
      <RoundApplicationForm
        initialData={{
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );
    const launch = screen.getByRole("button", { name: /Launch/i });
    await act(() => {
      fireEvent.click(launch);
    });

    const done = await screen.findByTestId("done");
    await act(() => {
      fireEvent.click(done);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });

  it("choosing try again restarts the action and closes the error modal", async () => {
    renderWrapped(
      <RoundApplicationForm
        initialData={{
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const launch = screen.getByRole("button", { name: /Launch/i });
    await act(() => {
      fireEvent.click(launch);
    });

    expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    const saveToIpfsCalls = saveToIPFSStub.mock.calls.length;
    expect(saveToIpfsCalls).toEqual(2);

    const tryAgain = await screen.findByTestId("tryAgain");
    await act(() => {
      fireEvent.click(tryAgain);
    });

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    expect(saveToIPFSStub.mock.calls.length).toEqual(saveToIpfsCalls + 2);
  });

  describe("when saving round application metadata succeeds but create round transaction fails", () => {
    beforeEach(() => {
      (useSaveToIPFSMutation as jest.Mock).mockReturnValue([
        saveToIPFSStub,
        {
          isError: false,
          isLoading: false,
          isSuccess: true,
        },
      ]);

      (useCreateRoundMutation as jest.Mock).mockReturnValue([
        createRoundStub,
        {
          isError: true,
          isLoading: false,
          isSuccess: false,
        },
      ]);
    });

    it("shows error modal when create round transaction fails", async () => {
      renderWrapped(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      await act(() => {
        fireEvent.click(launch);
      });

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });
  });
});
