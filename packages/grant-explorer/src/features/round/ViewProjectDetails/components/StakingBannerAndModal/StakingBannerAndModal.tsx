import { StakingModal } from "./StakingModal";
import { useCallback, useState } from "react";
import { StakingBanner } from "./StakingBanner";
import { useProjectDetailsParams } from "../../hooks/useProjectDetailsParams";
import { useIsStakable } from "./hooks/useIsStakable";

export const StakingBannerAndModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    chainId,
    roundId,
    applicationId: paramApplicationId,
  } = useProjectDetailsParams();

  const applicationId = paramApplicationId.includes("-")
    ? paramApplicationId.split("-")[1]
    : paramApplicationId;

  const stakingAppUrl = "https://staking-hub-mu.vercel.app"; // TODO: from env
  const stakeProjectUrl = `${stakingAppUrl}/#/staking-round/${chainId}/${roundId}?id=${applicationId}`;

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

  const isStakable = useIsStakable({
    chainId: chainIdNumber,
    roundId,
    applicationId,
  });

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
