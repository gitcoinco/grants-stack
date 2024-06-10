import { act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Store } from "redux";
import "wagmi";
import NetworkSwitchModal from "../NetworkSwitchModal";
import { renderWrapped } from "../../../utils/test_utils";
import setupStore from "../../../store";
import { RootState } from "../../../reducers/index";

describe("NetworkSwitchModal", () => {
  let store: Store<RootState>;
  let toggleModal: () => null;
  let onSwitch: (networkId?: number) => void;

  beforeEach(() => {
    store = setupStore();
    toggleModal = jest.fn();
    onSwitch = jest.fn();

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

  it("Button click > 'Switch Network' > should call switchChainAsync & onSwitch", async () => {
    const modal = screen.getByTestId("network-switch-modal");
    const switchBtn = modal.querySelector(".switch-button") as Element;

    await act(async () => {
      switchBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSwitch).toBeCalledTimes(1);
  });
});
