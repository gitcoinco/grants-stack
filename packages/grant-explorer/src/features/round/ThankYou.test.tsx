import { fireEvent, screen } from "@testing-library/react";
import ThankYou, {
  createTwitterShareText,
  createTwitterShareUrl,
  TwitterButton,
} from "./ThankYou";
import { renderWithContext } from "../../test-utils";
import { zeroAddress } from "viem";
import { expect } from "vitest";

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useAccount: () => ({
      address: "",
    }),
  };
});

describe("<TwitterButton />", () => {
  it("Should render text inside button", async () => {
    renderWithContext(
      <TwitterButton address={zeroAddress} isMrc={true} roundName={"Round"} />
    );

    expect(screen.getByText("Share on X")).toBeInTheDocument();
  });

  it("Should redirect to twitter with correct text", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {
      return null;
    });

    renderWithContext(
      <TwitterButton address={zeroAddress} isMrc={true} roundName={"Round"} />
    );

    fireEvent.click(screen.getByText("Share on X"));
    expect(openSpy).toHaveBeenCalledOnce();
    expect(openSpy).toHaveBeenCalledWith(
      "https://twitter.com/intent/tweet?text=I%20just%20donated%20to%20Round%20and%20more%20on%20%40gitcoin's%20%40grantsstack.%20Join%20me%20in%20making%20a%20difference%20by%20donating%20today%2C%20and%20check%20out%20the%20projects%20I%20supported%20on%20my%20Donation%20History%20page!%0A%0Ahttps%3A%2F%2Fexplorer.gitcoin.co%2F%23%2Fcontributors%2F0x0000000000000000000000000000000000000000",
      "_blank"
    );
  });
});

describe("createTwitterShareUrl", () => {
  it("encodes the url properly", function () {
    expect(
      createTwitterShareUrl({
        address: zeroAddress,
        isMrc: false,
      })
    ).toEqual(
      "https://twitter.com/intent/tweet?text=I%20just%20donated%20to%20a%20round%20on%20%40gitcoin's%20%40grantsstack.%20Join%20me%20in%20making%20a%20difference%20by%20donating%20today%2C%20and%20check%20out%20the%20projects%20I%20supported%20on%20my%20Donation%20History%20page!%0A%0Ahttps%3A%2F%2Fexplorer.gitcoin.co%2F%23%2Fcontributors%2F0x0000000000000000000000000000000000000000"
    );
  });
});

describe("createTwiterShareText", () => {
  it("handles no round name", function () {
    expect(
      createTwitterShareText({
        address: zeroAddress,
        isMrc: false,
      })
    ).toEqual(
      `I just donated to a round on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!

https://explorer.gitcoin.co/#/contributors/0x0000000000000000000000000000000000000000`
    );
  });

  it("handles no round name", function () {
    expect(
      createTwitterShareText({
        address: zeroAddress,
        isMrc: false,
      })
    ).toEqual(
      `I just donated to a round on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!

https://explorer.gitcoin.co/#/contributors/0x0000000000000000000000000000000000000000`
    );
  });

  it("handles one round, no mrc", function () {
    expect(
      createTwitterShareText({
        address: zeroAddress,
        isMrc: false,
        roundName: "Round",
      })
    ).toEqual(
      `I just donated to Round on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!

https://explorer.gitcoin.co/#/contributors/0x0000000000000000000000000000000000000000`
    );
  });

  it("handles one round plus mrc", function () {
    expect(
      createTwitterShareText({
        address: zeroAddress,
        isMrc: true,
        roundName: "Round",
      })
    ).toEqual(
      `I just donated to Round and more on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!

https://explorer.gitcoin.co/#/contributors/0x0000000000000000000000000000000000000000`
    );
  });
});

describe.skip("<ThankYou/>", () => {
  it("Should show twitter, go back home, view your trasaction button", async () => {
    renderWithContext(<ThankYou />);

    expect(screen.queryByTestId("view-tx-button")).toBeInTheDocument();
    expect(screen.queryByTestId("x-button")).toBeInTheDocument();
    expect(screen.queryByTestId("home-button")).toBeInTheDocument();
  });
});
