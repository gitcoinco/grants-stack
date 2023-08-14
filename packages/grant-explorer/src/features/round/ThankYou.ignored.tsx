import { render, screen } from "@testing-library/react";
import ThankYou from "./ThankYou";
import { RoundProvider } from "../../context/RoundContext";

describe.skip("<ThankYou/>", () => {
  it("Should show twitter, go back home, view your trasaction button", async () => {
    render(
      <RoundProvider>
        <ThankYou />
      </RoundProvider>
    );

    expect(await screen.queryByTestId("view-tx-button")).toBeInTheDocument();
    expect(await screen.queryByTestId("twitter-button")).toBeInTheDocument();
    expect(await screen.queryByTestId("home-button")).toBeInTheDocument();
  });
});
