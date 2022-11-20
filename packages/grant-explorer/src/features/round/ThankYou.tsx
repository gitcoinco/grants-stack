import { datadogLogs } from "@datadog/browser-logs";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import { Button } from "../common/styles";
import { ReactComponent as ThankYouBanner } from "../../assets/thank-you.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import { ChainId, getTxExplorer } from "../api/utils";


export default function ThankYou() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId/thankyou");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId, txHash } = useParams();

  const navigate = useNavigate();

  function TwitterButton() {

    return (
      <Button
        type="button"
        onClick={() => window.open("twitter.com", '_blank')} // TODO: UPDATE
        className="flex items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-10 border-grey-100 hover:shadow-md"
        data-testid="twitter-button"
      >
        <TwitterBlueIcon/>
        <span className="ml-2">Share on Twitter</span>
      </Button>
    )
  }

  function ViewTransactionButton() {
    return (
      <Button
        type="button"
        $variant="outline"
        onClick={() => window.open(getTxExplorer(chainId as ChainId, txHash), '_blank')}
        className="items-center justify-center shadow-sm text-sm rounded border-1 px-10 hover:shadow-md border"
        data-testid="view-tx-button"
      >
        See your transaction
      </Button>
    )
  }

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="mx-20 px-4 py-7 h-screen">
        <main>
          <div className="mx-auto text-center">
            <h1 className="text-4xl my-8">Thank you for supporting our community.</h1>

            <div className="flex justify-center gap-6">
              <TwitterButton />

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
              <ThankYouBanner/>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );

}