import { ChevronRightIcon } from "@heroicons/react/solid";
import { Link, useParams } from "react-router-dom";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { useEffect, useState } from "react";
import AccessDenied from "../common/AccessDenied";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { useProgramById } from "../../context/program/ReadProgramContext";
import { useRounds } from "../../context/round/RoundContext";
import { ProgressStatus } from "../api/types";
import { Spinner } from "../common/Spinner";
import { TabGroup } from "./TabGroup";
import { useAccount, useSwitchChain } from "wagmi";
import AlloV1Black from "common/src/icons/AlloV1Black";

export default function ViewProgram() {
  datadogLogs.logger.info("====> Route: /program/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { switchChain } = useSwitchChain();
  const { chainId, id: programId } = useParams() as {
    chainId?: string;
    id: string;
  };
  const { chain, connector } = useAccount();
  const programChainId = chainId ? Number(chainId) : chain?.id;
  const { program: programToRender, fetchProgramsStatus } =
    useProgramById(programId);
  const { fetchRoundStatus } = useRounds(programChainId as number, programId);
  const [programExists] = useState(true);
  const [hasAccess] = useState(true);

  useEffect(() => {
    if (programChainId !== chain?.id) {
      switchChain({ connector, chainId: programChainId as number });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return fetchProgramsStatus !== ProgressStatus.IS_SUCCESS ? (
    <Spinner text="We're fetching your Program." />
  ) : (
    <div className="h-screen flex flex-col relative bg-grey-50">
      {!programExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {programExists && hasAccess && (
        <>
          <Navbar programCta={true} />
          <div className="bg-[#F3F3F5] flex-grow flex flex-col items-center">
            <header className="w-full bg-white pl-2 py-6">
              <div className="w-full max-w-screen-2xl mx-auto px-8">
                <div className="flex flex-row items-center text-grey-400 font-normal text-sm font-sans">
                  <Link to={`/`}>
                    <p>Home</p>
                  </Link>
                  <ChevronRightIcon
                    className="h-6 w-6 mx-3"
                    aria-hidden="true"
                  />
                  <p>Program Details</p>
                </div>
                <div className="flex flex-row items-center">
                  <div className="flex">
                    <img
                      src={programToRender?.chain?.logo}
                      alt="Chain"
                      className="rounded-full w-6 h-6 mr-2"
                    />
                    {programToRender?.tags?.includes("allo-v1") && (
                      <div className="mt-1">
                        <AlloV1Black />
                      </div>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-[32px] my-2">
                    {programToRender?.metadata?.name || "Program Details"}
                  </h1>
                </div>
              </div>
            </header>
            <div className="w-full max-w-screen-2xl px-8 flex-grow">
              <main className="flex-grow flex flex-col">
                {fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
                  <Spinner text="We're fetching your Rounds." />
                )}
                <div className="px-2 py-3 md:py-6">
                  <TabGroup />
                </div>
              </main>
            </div>
          </div>
          <div className="w-full max-w-screen-2xl mx-auto px-8">
            <Footer />
          </div>
        </>
      )}
    </div>
  );
}
