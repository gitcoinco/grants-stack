import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/thank-you.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus } from "../api/types";
import { ChainId } from "common";
import { useAccount } from "wagmi";
import { Hex } from "viem";
import { useRoundById } from "../../context/RoundContext";
import xIcon from "../../assets/x-logo-black.png";

export function createTwitterShareText(props: TwitterButtonParams) {
  return `I just donated to ${props.roundName?.trim() ?? "a round"}${
    props.isMrc && props.roundName ? " and more" : ""
  } on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!\n\nhttps://explorer.gitcoin.co/#/contributors/${
    props.address
  }`;
}

export function createTwitterShareUrl(props: TwitterButtonParams) {
  const shareText = createTwitterShareText(props);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;
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
      className="flex items-center justify-center shadow-sm text-xs rounded-lg border-1 text-black bg-white px-4 sm:px-10 hover:shadow-md"
      data-testid="x-button"
    >
      <img src={xIcon} alt="X logo" className="w-4 h-4 font-semibold" />
      <span className="ml-2">Share on X</span>
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
    cart.projects
      .filter((proj) => checkedOutChains.includes(proj.chainId))
      .forEach((proj) => {
        cart.remove(proj);
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
  // const showBackToCartButton =
  //   cart.projects.filter((proj) => !checkedOutChains.includes(proj.chainId))
  //     .length > 0;

  /** Fetch round data for tweet */
  const checkedOutProjects = useCheckoutStore((state) =>
    state.getCheckedOutProjects()
  );

  const isMrc =
    new Set(checkedOutProjects.map((project) => project.chainId)).size > 1;
  const topProject = checkedOutProjects
    .sort((a, b) =>
      Number(a.amount) > Number(b.amount)
        ? -1
        : Number(a.amount) < Number(b.amount)
        ? 1
        : 0
    )
    .at(0);

  const { round } = useRoundById(
    /* If we don't have a round, pass in invalid params and silently fail */
    Number(topProject?.chainId),
    topProject?.roundId ?? ""
  );

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col min-h-screen relative bg-bottom bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <main className="flex-grow">
          <div className="flex flex-col text-center">
            <h1 className="text-5xl mt-28 mb-8 font-sans">
              Thank you for your support!
            </h1>
            <div className="flex flex-col gap-5 items-center justify-center">
              <div className="flex gap-5 items-center justify-center">
                <TwitterButton
                  address={address ?? "0x"}
                  roundName={round?.roundMetadata?.name}
                  isMrc={isMrc}
                />
                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => navigate("/")}
                  className="items-center justify-center text-xs rounded-lg w-[193px] border-1 bg-orange-100 hover:shadow-md px-10"
                  data-testid="home-button"
                >
                  Back home
                </Button>
              </div>
              <Button
                type="button"
                onClick={() => navigate(`/contributors/${address}`)}
                className="items-center justify-center text-xs text-black rounded-lg border border-solid bg-grey-100 border-grey-100 px-2 hover:shadow-md sm:px-10"
                data-testid="donation-history-button"
              >
                Donation History
              </Button>
            </div>
          </div>
        </main>
        <div className="fixed -bottom-6 right-11 w-full z-20">
          <Footer />
        </div>
      </div>
    </>
  );
}
