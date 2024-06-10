import "@testing-library/jest-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import { Store } from "redux";
import NetworkForm from "../NetworkForm";
import setupStore from "../../../store";
import { renderWrapped } from "../../../utils/test_utils";
import { web3ChainIDLoaded } from "../../../actions/web3";
import { RootState } from "../../../reducers";
import { ProjectFormStatus } from "../../../types";

describe("NetworkForm", () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = setupStore();
  });

  it("should render", () => {
    const setVerifying = jest.fn();

    renderWrapped(<NetworkForm setVerifying={setVerifying} />, store);
    expect(
      screen.queryByText(
        "Which network would you like to create this project on?"
      )
    ).toBeInTheDocument();
  });

  it("Next button should be disabled with mismatched chainId", () => {
    const setVerifying = jest.fn();

    store.dispatch(web3ChainIDLoaded(1));

    renderWrapped(<NetworkForm setVerifying={setVerifying} />, store);

    const networkForm = screen.getByTestId("network-form");
    const networkSelect = networkForm.querySelector("select") as Element;

    act(() => {
      fireEvent.change(networkSelect, { target: { value: "5" } });
    });

    const nextBtn = networkForm.querySelector(".base-btn") as Element;

    expect(nextBtn).toBeDisabled();
  });

  it("Next button work with correct chainId", () => {
    const setVerifying = jest.fn();

    store.dispatch(web3ChainIDLoaded(1));

    renderWrapped(<NetworkForm setVerifying={setVerifying} />, store);

    const networkForm = screen.getByTestId("network-form");
    const nextBtn = networkForm.querySelector(".base-btn") as Element;

    act(() => {
      nextBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(setVerifying).toBeCalledTimes(1);
    expect(setVerifying).toHaveBeenCalledWith(ProjectFormStatus.Metadata);
  });

  it("Network change modal should be visible", () => {
    const setVerifying = jest.fn();

    store.dispatch(web3ChainIDLoaded(1));

    renderWrapped(<NetworkForm setVerifying={setVerifying} />, store);

    const networkForm = screen.getByTestId("network-form");
    const networkSelect = networkForm.querySelector("select") as Element;

    act(() => {
      fireEvent.change(networkSelect, { target: { value: "5" } });
    });

    expect(
      screen.queryByText("Switch Networks to Continue")
    ).toBeInTheDocument();
  });
});
