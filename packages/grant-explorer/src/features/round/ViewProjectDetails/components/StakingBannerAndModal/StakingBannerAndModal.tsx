import { StakingModal } from "./StakingModal";
import { useCallback, useState } from "react";
import { StakingBanner } from "./StakingBanner";
import { useProjectDetailsParams } from "../../hooks/useProjectDetailsParams";

// TODO: either from metadata or from env value
// ONLY GITCOIN ROUNDS OF GG23
const STAKABLE_ROUNDS: Array<{ chainId: number; roundId: string }> = [
  { chainId: 42161, roundId: "863" },
  { chainId: 42161, roundId: "865" },
  { chainId: 42161, roundId: "867" },
  // { chainId: 42220, roundId: "27" },
  // { chainId: 42220, roundId: "28" },
  // { chainId: 42220, roundId: "29" },
  // { chainId: 42220, roundId: "30" },
  // { chainId: 42220, roundId: "31" },
  // { chainId: 42220, roundId: "32" },
  // { chainId: 42220, roundId: "33" },
  // { chainId: 42220, roundId: "34" },
  // { chainId: 42220, roundId: "35" },
];

export const StakingBannerAndModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { chainId, roundId, applicationId } = useProjectDetailsParams();

  const stakingAppUrl = "https://staking-hub-mu.vercel.app"; // TODO: from env
  const stakeProjectUrl = `${stakingAppUrl}/#/staking-round/${chainId}/${roundId}?id=${applicationId}`;

  console.log("stakeProjectUrl", stakeProjectUrl);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleStake = useCallback(() => {
    window.open(stakeProjectUrl, "_blank");
    handleCloseModal();
  }, [handleCloseModal, stakeProjectUrl]);

  const chainIdNumber = chainId ? parseInt(chainId, 10) : 0;

  const isStakable = STAKABLE_ROUNDS.some(
    (round) => round.chainId === chainIdNumber && round.roundId === roundId
  );

  if (!isStakable) {
    return null;
  }

  return (
    <div className="mt-2 mb-6">
      <StakingBanner onClick={handleOpenModal} />
      <StakingModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onStake={handleStake}
      />
    </div>
  );
};
