import { StakingModal } from "./StakingModal";
import { useCallback, useState } from "react";
import { StakingBanner } from "./StakingBanner";
import { useProjectDetailsParams } from "../../hooks/useProjectDetailsParams";
import { useIsStakable } from "./hooks/useIsStakable";
import { useDonationPeriod } from "./hooks/useDonationPeriod";
import { StakingButton } from "./StakingButton";
import { StakingCountDownLabel } from "./StakingCountDownLabel";

const STAKING_APP_URL = process.env.REACT_APP_STAKING_APP;

const COUNTDOWN_LABEL = "Staking begins in";
const COUNTDOWN_LIMIT_MINUTES = 3;

export const StakingBannerAndModal = ({
  isRoundView,
}: {
  isRoundView?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    chainId,
    roundId,
    applicationId: paramApplicationId,
  } = useProjectDetailsParams();

  const applicationId = paramApplicationId?.includes("-")
    ? paramApplicationId.split("-")[1]
    : paramApplicationId;

  const stakeProjectUrl = `${STAKING_APP_URL}/#/staking-round/${chainId}/${roundId}?id=${applicationId}`;

  const stakeRoundUrl = `${STAKING_APP_URL}/#/staking-round/${chainId}/${roundId}`;

  const claimRewardsUrl = `${STAKING_APP_URL}/#/claim-rewards`;

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

  const handleStakeRound = useCallback(() => {
    window.open(stakeRoundUrl, "_blank");
    handleCloseModal();
  }, [handleCloseModal, stakeRoundUrl]);

  const handleClaimRewards = useCallback(() => {
    window.open(claimRewardsUrl, "_blank");
  }, [claimRewardsUrl]);

  const chainIdNumber = chainId ? parseInt(chainId, 10) : 0;

  const isStakable = useIsStakable({
    chainId: chainIdNumber,
    roundId,
  });

  const { isDonationPeriod, timeToDonationStart, timeToDonationEnd } =
    useDonationPeriod({
      chainId: chainIdNumber,
      roundId,
      refreshInterval: 60 * 1000, // 1 minute
    });

  const isCountDownToStartPeriod =
    timeToDonationStart && timeToDonationStart.totalMilliseconds > 0;

  const isRoundEnded =
    timeToDonationEnd && timeToDonationEnd.totalMilliseconds < 0;

  if (isStakable && isRoundEnded) {
    return (
      <div className="mt-2 items-center justify-center">
        <StakingBanner isRoundView={isRoundView} isClaimPeriod={true}>
          <StakingButton
            onClick={handleClaimRewards}
            isRoundView={isRoundView}
            isClaimPeriod={true}
          />
        </StakingBanner>
      </div>
    );
  }
  if (isStakable && isCountDownToStartPeriod) {
    return (
      <div className="mt-2 mb-6">
        <StakingBanner isRoundView={isRoundView}>
          <StakingCountDownLabel
            timeLeft={timeToDonationStart}
            label={COUNTDOWN_LABEL}
            limitMinutes={COUNTDOWN_LIMIT_MINUTES}
            isRoundView={isRoundView}
          />
        </StakingBanner>
      </div>
    );
  }

  if (isStakable && isDonationPeriod) {
    return (
      <div className="mt-2 mb-6">
        <StakingBanner isRoundView={isRoundView}>
          <StakingButton onClick={handleOpenModal} isRoundView={isRoundView} />
        </StakingBanner>
        <StakingModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          onStake={isRoundView ? handleStakeRound : handleStake}
          isRoundView={isRoundView ?? false}
        />
      </div>
    );
  }
  return null;
};
