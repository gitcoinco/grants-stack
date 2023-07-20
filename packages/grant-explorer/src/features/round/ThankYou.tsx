import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import { useCart } from "../../context/CartContext";
import { useQFDonation } from "../../context/QFDonationContext";
import { useRoundById } from "../../context/RoundContext";
import { ChainId, getTxExplorer } from "../api/utils";
import Navbar from "../common/Navbar";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou",
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  // scroll to top of window on load
  window.scrollTo(0, 0);

  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);
  const roundName = round?.roundMetadata?.name;

  const { txHash } = useQFDonation();

  const navigate = useNavigate();

  const [cart, , handleRemoveProjectsFromCart] = useCart();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    handleRemoveProjectsFromCart(cart, roundId!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function TwitterButton(props: { roundName?: string }) {
    const shareText = `I just donated to the ${props.roundName?.trim()} on @gitcoin. Join me in making a difference by donating today!\n\nhttps://explorer.gitcoin.co/#/round/${chainId}/${roundId}`;
    const shareUrl = `http://twitter.com/share?text=${encodeURIComponent(
      shareText,
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

  function ViewTransactionButton() {
    return (
      <Button
        type="button"
        $variant="outline"
        onClick={() =>
          window.open(getTxExplorer(chainId as ChainId, txHash), "_blank")
        }
        className="items-center justify-center shadow-sm text-sm rounded border-1 px-10 hover:shadow-md border"
        data-testid="view-tx-button"
      >
        See your transaction
      </Button>
    );
  }

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
        <main>
          <div className="text-center">
            <h1 className="text-4xl my-8">
              Thank you for supporting our community.
            </h1>

            <div className="flex justify-center gap-6">
              <TwitterButton roundName={roundName} />

              <ViewTransactionButton />
            </div>

            <Button
              type="button"
              $variant="outline"
              onClick={() => navigate(`/round/${chainId}/${roundId}`)}
              className="my-8 items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 px-10"
              data-testid="home-button"
            >
              Go back home
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
