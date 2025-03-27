import { StakingModal } from "./StakingModal";
import { useCallback, useState } from "react";
import { StakingBanner } from "./StakingBanner";
import { useProjectDetailsParams } from "../../hooks/useProjectDetailsParams";
import { useIsStakable } from "./hooks/useIsStakable";
import { useDonationPeriod } from "./hooks/useDonationPeriod";
import { StakingButton } from "./StakingButton";
import { StakingCountDownLabel } from "./StakingCountDownLabel";

const STAKING_APP_URL = "https://staking-hub-mu.vercel.app"; // TODO: from env

const COUNTDOWN_DAYS = 3;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const COUNTDOWN_STARTS_IN_MILLISECONDS = COUNTDOWN_DAYS * DAY_IN_MILLISECONDS;
const COUNTDOWN_LABEL = "Staking begins in";
const COUNTDOWN_LIMIT_MINUTES = 3;

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

  const stakeProjectUrl = `${STAKING_APP_URL}/#/staking-round/${chainId}/${roundId}?id=${applicationId}`;

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
  });

  const { isDonationPeriod, timeToDonationStart } = useDonationPeriod({
    chainId: chainIdNumber,
    roundId,
    applicationId,
    refreshInterval: 60 * 1000, // 1 minute
  });

  const isCountDownToStartPeriod =
    timeToDonationStart &&
    timeToDonationStart.totalMilliseconds > 0 &&
    timeToDonationStart.totalMilliseconds < COUNTDOWN_STARTS_IN_MILLISECONDS;

  if (isStakable && isCountDownToStartPeriod) {
    return (
      <div className="mt-2 mb-6">
        <StakingBanner>
          <StakingCountDownLabel
            timeLeft={timeToDonationStart}
            label={COUNTDOWN_LABEL}
            limitMinutes={COUNTDOWN_LIMIT_MINUTES}
          />
        </StakingBanner>
      </div>
    );
  }

  if (isStakable && isDonationPeriod) {
    return (
      <div className="mt-2 mb-6">
        <StakingBanner>
          <StakingButton onClick={handleOpenModal} />
        </StakingBanner>
        <StakingModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          onStake={handleStake}
        />
      </div>
    );
  }
  return null;
};
