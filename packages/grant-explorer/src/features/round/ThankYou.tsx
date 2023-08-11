import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import Navbar from "../common/Navbar";
import { useCartStorage } from "../../store";
import { useCheckoutStore } from "../../checkoutStore";
import { ProgressStatus } from "../api/types";
import { ChainId } from "common";
import { useAccount } from "wagmi";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  // scroll to top of window on load
  window.scrollTo(0, 0);

  const navigate = useNavigate();

  const cart = useCartStorage();
  const checkoutStore = useCheckoutStore();
  const { address } = useAccount();

  /** Remove checked out projects from cart, but keep the ones we didn't yet checkout succesfully. */
  const checkedOutChains = Object.keys(checkoutStore.voteStatus)
    .filter(
      (key) =>
        checkoutStore.voteStatus[Number(key) as ChainId] ===
        ProgressStatus.IS_SUCCESS
    )
    .map(Number);
  useEffect(() => {
    cart.projects
      .filter((proj) => checkedOutChains.includes(proj.chainId))
      .forEach((proj) => cart.remove(proj.grantApplicationId));
  }, [cart, checkedOutChains]);

  /** If there are projects left to check out, show a Back to cart button */
  const showBackToCartButton =
    cart.projects.filter((proj) => !checkedOutChains.includes(proj.chainId))
      .length > 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function TwitterButton(props: { roundName?: string }) {
    const shareText = `I just donated to the ${props.roundName?.trim()} on @gitcoin. Join me in making a difference by donating today!\n\nhttps://explorer.gitcoin.co/#/`;
    const shareUrl = `https://twitter.com/share?text=${encodeURIComponent(
      shareText
    )}`;

    return (
      <Button
        type="button"
        onClick={() => window.open(shareUrl, "_blank")}
        className="flex items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-10 border-grey-100 hover:shadow-md"
        data-testid="twitter-button"
      >
        <TwitterBlueIcon />
        <span className="ml-2">Share on Twitter</span>
      </Button>
    );
  }

  // function ViewTransactionButton() {
  //   return (
  //     <Button
  //       type="button"
  //       $variant="outline"
  //       onClick={() =>
  //         window.open(getTxExplorerTxLink(Number(chainId), txHash), "_blank")
  //       }
  //       className="items-center justify-center shadow-sm text-sm rounded border-1 px-10 hover:shadow-md border"
  //       data-testid="view-tx-button"
  //     >
  //       See your transaction
  //     </Button>
  //   );
  // }

  return (
    <>
      <Navbar roundUrlPath={"/"} />
      <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
        <main>
          <div className="text-center">
            <h1 className="text-4xl my-8">
              Thank you for supporting our community.
            </h1>

            {showBackToCartButton ? (
              <Button
                type="button"
                $variant="outline"
                onClick={() => navigate("/cart")}
                className="mt-4 mr-4 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
                data-testid="home-button"
              >
                Back to Cart
              </Button>
            ) : (
              <Button
                type="button"
                $variant="outline"
                onClick={() => navigate("/")}
                className="mt-4 mr-4 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
                data-testid="home-button"
              >
                Go back home
              </Button>
            )}

            <Button
              type="button"
              $variant="outline"
              onClick={() => navigate(`/contributors/${address}`)}
              className="mt-4 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
              data-testid="donation-history-button"
            >
              View Donation History
            </Button>

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
