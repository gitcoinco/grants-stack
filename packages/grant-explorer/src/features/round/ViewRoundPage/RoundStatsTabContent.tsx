import { useMemo, useState } from "react";
import { TToken } from "common";

import { Round } from "../../api/types";
import { useDataLayer } from "data-layer";
import { useRoundApprovedApplications } from "../../projects/hooks/useRoundApplications";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import GenericModal from "../../common/GenericModal";

import { ShareButton } from "./ShareButton";
import { ShareStatsButton } from "./ShareStatsButton";
import { Stats } from "./Stats";

export const RoundStatsTabContent = ({
  roundId,
  chainId,
  round,
  token,
  tokenSymbol,
}: {
  roundId: string;
  round: Round;
  chainId: number;
  token?: TToken;
  tokenSymbol?: string;
}): JSX.Element => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dataLayer = useDataLayer();
  const { data: applications, isLoading: isGetApplicationsLoading } =
    useRoundApprovedApplications(
      {
        chainId,
        roundId,
      },
      dataLayer
    );

  const totalUSDCrowdfunded = useMemo(() => {
    return (
      applications
        ?.map((application) => application.totalAmountDonatedInUsd)
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const totalDonations = useMemo(() => {
    return (
      applications
        ?.map((application) => Number(application.totalDonationsCount ?? 0))
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const ShareModal = () => {
    const ShareModalBody = () => (
      <div className="items-center gap-y-2 gap-x-4 mt-10 w-full grid sm:grid-cols-2">
        <ShareButton
          round={round}
          tokenSymbol={tokenSymbol}
          totalUSDCrowdfunded={totalUSDCrowdfunded}
          totalDonations={totalDonations}
          type="TWITTER"
        />
        <ShareButton
          round={round}
          tokenSymbol={tokenSymbol}
          totalUSDCrowdfunded={totalUSDCrowdfunded}
          totalDonations={totalDonations}
          type="FARCASTER"
        />
      </div>
    );

    return (
      <GenericModal
        title="Share this round’s stats on social media!"
        titleSize={"lg"}
        body={<ShareModalBody />}
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
      />
    );
  };

  return (
    <>
      <section className="flex flex-col gap-10 sm:gap-16">
        <div className="w-full">
          <div className="flex justify-end items-center gap-2">
            <ShareStatsButton handleClick={() => setIsShareModalOpen(true)} />
          </div>
          <div className="max-w-[60rem] w-full m-auto mt-12">
            <Stats
              token={token}
              tokenSymbol={tokenSymbol}
              round={round}
              totalCrowdfunded={totalUSDCrowdfunded}
              totalDonations={totalDonations}
              totalDonors={round.uniqueDonorsCount ?? 0}
              totalProjects={applications?.length ?? 0}
              chainId={chainId}
              statsLoading={isGetApplicationsLoading}
            />
          </div>
        </div>

        <div className="max-w-[53rem] m-auto w-full bg-green-50 rounded-2xl py-8 px-2 flex justify-center items-center gap-8 flex-wrap">
          <p className="text-xl sm:text-2xl font-medium">
            Want to check out more stats?
          </p>
          <a
            href={`https://reportcards.gitcoin.co/${chainId}/${roundId}`}
            target="_blank"
            className="rounded-lg px-4 py-2.5 font-mono bg-green-200 hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
            data-testid="share-results-footer"
          >
            <PresentationChartBarIcon className="w-4 h-4" />
            <span>Round report card</span>
          </a>
        </div>

        <ShareModal />
      </section>
    </>
  );
};
