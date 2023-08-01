import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import { useQFDonation } from "../../context/QFDonationContext";
import Navbar from "../common/Navbar";
import { getTxExplorerTxLink } from "../api/utils";
import { useCartStorage } from "../../store";

export default function ThankYou() {
  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:txHash/thankyou"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  // scroll to top of window on load
  window.scrollTo(0, 0);

  const { txHash } = useQFDonation();

  const navigate = useNavigate();

  const cart = useCartStorage();
  useEffect(() => {
    cart.clear();
  }, []);

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

            <div className="flex justify-center gap-6">
              {/*<TwitterButton roundName={roundName} />*/}

              {/*<ViewTransactionButton />*/}
            </div>

            <Button
              type="button"
              $variant="outline"
              onClick={() => navigate("/")}
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
