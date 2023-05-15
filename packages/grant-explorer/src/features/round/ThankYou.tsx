import { datadogLogs } from "@datadog/browser-logs";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Button } from "common/src/styles";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import { ChainId, getTxExplorer } from "../api/utils";
import { useRoundById } from "../../context/RoundContext";
import { useQFDonation } from "../../context/QFDonationContext";
import Footer from "common/src/components/Footer";
import { useCart } from "../../context/CartContext";
import { useEffect } from "react";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
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
    const shareText = `I just donated to the ${props.roundName} on @gitcoin. Join me in making a difference by donating today! https://explorer.gitcoin.co/%23/round/${chainId}/${roundId}`;

    return (
      <Button
        type="button"
        onClick={() =>
          window.open(`http://twitter.com/share?text=${shareText}`, "_blank")
        }
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
        <Footer />
      </div>
    </>
  );
}
