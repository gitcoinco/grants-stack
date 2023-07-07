import React from "react";
import { act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as wagmi from "wagmi";
import { Store } from "redux";
import { mainnet } from "wagmi/chains";
import NetworkSwitchModal from "../NetworkSwitchModal";
import { renderWrapped } from "../../../utils/test_utils";
import setupStore from "../../../store";
import { RootState } from "../../../reducers/index";

const chains = [mainnet];

describe("NetworkSwitchModal", () => {
  let store: Store<RootState>;
  let toggleModal: () => null;
  let onSwitch: (networkId?: number) => void;
  let switchNetworkAsync:
    | ((chainId_?: number | undefined) => Promise<wagmi.Chain>)
    | undefined;

  beforeEach(() => {
    store = setupStore();
    toggleModal = jest.fn();
    switchNetworkAsync = jest
      .fn()
      .mockImplementation((chainId_?: number | undefined) =>
        chains.find((i) => chainId_ === i.id)
      );
    onSwitch = jest.fn();

    jest.spyOn(wagmi, "useSwitchNetwork").mockReturnValue({
      chains,
      data: undefined,
      error: null,
      isError: false,
      isIdle: false,
      isLoading: false,
      isSuccess: false,
      pendingChainId: undefined,
      reset(): void {
        throw new Error("Function not implemented.");
      },
      status: "error",
      switchNetwork: undefined,
      variables: undefined,
      switchNetworkAsync,
    });

    renderWrapped(
      <NetworkSwitchModal
        modalOpen
        networkId={1}
        toggleModal={toggleModal}
        onSwitch={onSwitch}
      />,
      store
    );
  });

  it("should show modal", () => {
    expect(
      screen.queryByText("Switch Networks to Continue")
    ).toBeInTheDocument();
  });

  it("Button click > Cancel > should call toggleModal", () => {
    const modal = screen.getByTestId("network-switch-modal");
    const cancelBtn = modal.querySelector(".cancel-button") as Element;

    act(() => {
      cancelBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(toggleModal).toBeCalledTimes(1);
  });

  it("Button click > 'Switch Network' > should call switchNetworkAsync & onSwitch", async () => {
    const modal = screen.getByTestId("network-switch-modal");
    const switchBtn = modal.querySelector(".switch-button") as Element;

    await act(async () => {
      switchBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(switchNetworkAsync).toBeCalledTimes(1);
    expect(onSwitch).toBeCalledTimes(1);
  });
});
