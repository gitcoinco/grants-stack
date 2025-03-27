import { useApplication } from "../../../../../projects/hooks/useApplication";
import { useDataLayer } from "data-layer";
import { isInfiniteDate } from "../../../../../api/utils";
import { useMemo } from "react";

export const useIsDonationPeriod = ({
  chainId,
  roundId,
  applicationId,
}: {
  chainId: number;
  roundId: string;
  applicationId: string;
}) => {
  const dataLayer = useDataLayer();

  const { data: application } = useApplication(
    {
      chainId,
      roundId,
      applicationId,
    },
    dataLayer
  );

  const isDonationPeriod = useMemo<boolean | undefined>(() => {
    if (!application) return undefined;
    const { donationsStartTime, donationsEndTime } = application?.round ?? {};
    if (
      !donationsStartTime ||
      !donationsEndTime ||
      isInfiniteDate(new Date(donationsStartTime)) ||
      isInfiniteDate(new Date(donationsEndTime))
    )
      return false;

    const currentTime = new Date();
    const donationsStartTimeDate = new Date("2025-03-02T12:00:00+00:00");
    const donationsEndTimeDate = new Date(donationsEndTime);
    return (
      currentTime >= donationsStartTimeDate &&
      currentTime <= donationsEndTimeDate
    );
  }, [application]);

  return isDonationPeriod;
};
