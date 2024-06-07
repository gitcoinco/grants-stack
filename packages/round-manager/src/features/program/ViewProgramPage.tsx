import { ChevronRightIcon, UserIcon } from "@heroicons/react/solid";
import { Link, useParams } from "react-router-dom";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";
import { useEffect, useState } from "react";
import { abbreviateAddress } from "../api/utils";
import AccessDenied from "../common/AccessDenied";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { useProgramById } from "../../context/program/ReadProgramContext";
import { useRounds } from "../../context/round/RoundContext";
import { ProgressStatus } from "../api/types";
import { Spinner } from "../common/Spinner";
import { TabGroup } from "./TabGroup";
import { useWallet } from "common";
import { useAccount, useSwitchChain } from "wagmi";

export default function ViewProgram() {
  datadogLogs.logger.info("====> Route: /program/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { switchChain } = useSwitchChain();
  const { chainId, id: programId } = useParams() as {
    chainId?: string;
    id: string;
  };
  const { connector } = useAccount();
  const chain = useWallet().chain;
  const programChainId = chainId ? Number(chainId) : chain?.id;

  const { program: programToRender, fetchProgramsStatus } = useProgramById(
    programChainId,
    programId
  );
  const { fetchRoundStatus } = useRounds(programChainId, programId);
  const [programExists] = useState(true);
  const [hasAccess] = useState(true);

  useEffect(() => {
    if (programChainId !== chain.id) {
      switchChain({ connector, chainId: programChainId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const operatorWallets: JSX.Element = (
    <div className="flex flex-row flex-wrap">
      {programToRender?.operatorWallets.map((operatorWallet, index) => (
        <div
          className="bg-white text-grey-400 pb-2 pr-5"
          data-testid="program-operator-wallet"
          key={index}
        >
          <UserIcon className="inline h-4 w-4 text-grey-400 mr-1" />
          <span className="text-sm text-grey-400" key={index}>
            {abbreviateAddress(operatorWallet)}
          </span>
        </div>
      )) || (
        <p className="text-grey-400 text-sm">Fetching operator wallets...</p>
      )}
    </div>
  );

  return fetchProgramsStatus !== ProgressStatus.IS_SUCCESS ? (
    <Spinner text="We're fetching your Program." />
  ) : (
    <>
      {!programExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {programExists && hasAccess && (
        <>
          <Navbar programCta={true} />
          <div className="container mx-auto flex flex-col">
            <header className="flex flex-col justify-center border-b border-grey-100 pl-2 py-6">
              <div className="flex flex-row items-center text-grey-400 font-bold text-sm font-sans">
                <Link to={`/`}>
                  <p>Home</p>
                </Link>
                <ChevronRightIcon className="h-6 w-6 mx-3" aria-hidden="true" />
                <p>Program Details</p>
              </div>
              <h1 className="text-3xl sm:text-[32px] my-2">
                {programToRender?.metadata?.name || "Program Details"}
              </h1>
              {operatorWallets}
            </header>
            <main className="flex-grow flex flex-col">
              {fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
                <Spinner text="We're fetching your Rounds." />
              )}
              <div className="px-2 py-3 md:py-6">
                <TabGroup />
              </div>
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}
