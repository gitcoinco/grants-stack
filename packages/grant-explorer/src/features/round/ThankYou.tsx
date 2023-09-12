import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus, Round } from "../api/types";
import { ChainId } from "common";
import { useAccount } from "wagmi";
import { Hex } from "viem";
import { getRoundById } from "../api/round";

export function createTwitterShareText(props: TwitterButtonParams) {
  return `I just donated to ${props.roundName ?? "a round"}${
    props.isMrc && props.roundName ? " and more" : ""
  } on @gitcoin. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!\n\nhttps://explorer.gitcoin.co/#/contributors/${
    props.address
  }`;
}

export function createTwitterShareUrl(props: TwitterButtonParams) {
  const shareText = createTwitterShareText(props);
  return `https://twitter.com/share?text=${encodeURIComponent(shareText)}`;
}

type TwitterButtonParams = {
  address: Hex;
  roundName?: string;
  isMrc: boolean;
};

export function TwitterButton(props: TwitterButtonParams) {
  const shareUrl = createTwitterShareUrl(props);

  return (
    <Button
      type="button"
      onClick={() => window.open(shareUrl, "_blank")}
      className="flex items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-4 sm:px-10 border-grey-100 hover:shadow-md"
      data-testid="twitter-button"
    >
      <TwitterBlueIcon />
      <span className="ml-2">Share on Twitter</span>
    </Button>
  );
}

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const navigate = useNavigate();

  const cart = useCartStorage();
  const checkoutStore = useCheckoutStore();
  const { address } = useAccount();

  /** A round to put into the Tweet */
  const [round, setRound] = useState<Round | undefined>();
  const [isMrc, setIsMrc] = useState(false);

  /** Remove checked out projects from cart, but keep the ones we didn't yet check out succesfully. */
  const checkedOutChains = useMemo(
    () =>
      Object.keys(checkoutStore.voteStatus)
        .filter(
          (key) =>
            checkoutStore.voteStatus[Number(key) as ChainId] ===
            ProgressStatus.IS_SUCCESS
        )
        .map(Number),
    [checkoutStore]
  );

  /** Cleanup */
  useEffect(() => {
    /** Get a random round from the user's cart before it gets cleared*/
    if (cart.projects.length > 0) {
      const roundId = cart.projects[0].roundId;
      getRoundById(roundId, cart.projects[0].chainId).then((round) => {
        setRound(round);
      });
    }

    /** Naively test if we checked out multiple chains */
    if (cart.projects.length > 2) {
      setIsMrc(true);
    }

    cart.projects
      .filter((proj) => checkedOutChains.includes(proj.chainId))
      .forEach((proj) => {
        cart.remove(proj.grantApplicationId);
      });

    checkoutStore.setChainsToCheckout([]);

    checkedOutChains.forEach((chain) => {
      checkoutStore.setVoteStatusForChain(chain, ProgressStatus.NOT_STARTED);
      checkoutStore.setPermitStatusForChain(chain, ProgressStatus.NOT_STARTED);
      checkoutStore.setChainSwitchStatusForChain(
        chain,
        ProgressStatus.NOT_STARTED
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** If there are projects left to check out, show a Back to cart button */
  const showBackToCartButton =
    cart.projects.filter((proj) => !checkedOutChains.includes(proj.chainId))
      .length > 0;

  return (
    <>
      <Navbar />
      <div className="relative top-28 lg:mx-20 px-4 py-7 h-screen">
        <main>
          <div className="text-center">
            <h1 className="text-4xl my-8">
              Thank you for supporting our community.
            </h1>

            <div className={"flex flex-col gap-5 items-center justify-center"}>
              <div className={"flex gap-5 items-center justify-center"}>
                <TwitterButton
                  address={address ?? "0x"}
                  roundName={round?.roundMetadata?.name}
                  isMrc={isMrc}
                />

                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => navigate(`/contributors/${address}`)}
                  className="items-center justify-center shadow-sm text-sm rounded border border-solid border-grey-100 px-2 sm:px-10"
                  data-testid="donation-history-button"
                >
                  View Donation History
                </Button>
              </div>

              {showBackToCartButton ? (
                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => navigate("/cart")}
                  className="items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
                  data-testid="home-button"
                >
                  Back to Cart
                </Button>
              ) : (
                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => navigate("/")}
                  className="items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
                  data-testid="home-button"
                >
                  Go back home
                </Button>
              )}
            </div>

            <div className="mt-11">
              <div className="flex justify-center">
                <ThankYouBanner />
              </div>
            </div>
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}
