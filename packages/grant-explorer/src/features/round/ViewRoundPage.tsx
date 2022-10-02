import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";

export default function ViewRound() {

  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const [roundExists, setRoundExists] = useState(true);
  useEffect(() => {
    setRoundExists(!!round)
  }, [round]);

  return (
    isLoading ? (
      <Spinner text="We're fetching the Round." />
    ) :
    (
      <>
        {!roundExists && <NotFoundPage />}
        {roundExists &&
          <>
          <Navbar />
            <div className="container mx-auto px-4 py-16 h-screen">
              <main>
                <p>
                  <span>Round Name: </span>
                  <span>{round?.roundMetadata!.name}</span>
                </p>
                <p>
                  <span>Program: </span>
                  <span>{round?.ownedBy}</span>
                </p>
              </main>
            </div>
          <Footer />
          </>
        }
      </>
    )
  )
}