import { Button } from "common/src/styles";
import {
  TimeLeft,
  getTimeLeft,
  isInfiniteDate,
  parseTimeLeftString,
} from "../api/utils";

type ApplicationPeriodStatus =
  | "pre-application"
  | "post-application"
  | "during-application";

const generateCountdownString = (
  targetDate: Date | undefined
): string | undefined => {
  if (!targetDate) return undefined;

  const targetDateString = Math.round(targetDate.getTime() / 1000).toString();
  const timeLeft: TimeLeft = getTimeLeft(targetDateString);

  const timeLeftString: string = parseTimeLeftString(timeLeft);

  return timeLeftString;
};

const generateBannerString = (
  status: ApplicationPeriodStatus,
  targetDate: Date | undefined
): string => {
  switch (status) {
    case "pre-application":
      return `Applications open in ${generateCountdownString(targetDate)}!`;
    case "during-application":
      return targetDate === undefined || isInfiniteDate(targetDate)
        ? "Applications are open"
        : `Applications close in ${generateCountdownString(targetDate)}!`;
    case "post-application":
      return `Applications are closed`;
    default:
      throw new Error("Unknown ApplicationPeriodStatus");
  }
};

function ApplicationsCountdownBanner(props: {
  startDate: Date;
  endDate: Date;
  applicationURL: string;
}) {
  const { startDate, endDate, applicationURL } = props;

  let targetDate: Date | undefined = undefined;
  let status: ApplicationPeriodStatus = "post-application";

  const currentTime = new Date();

  const isBeforeApplicationPeriod = currentTime < startDate;
  const isDuringApplicationPeriod =
    isInfiniteDate(endDate) ||
    (currentTime >= startDate && currentTime < endDate);

  if (isDuringApplicationPeriod) {
    targetDate = endDate;
    status = "during-application";
  } else if (isBeforeApplicationPeriod) {
    targetDate = startDate;
    status = "pre-application";
  }

  const bannerString = generateBannerString(status, targetDate);

  return (
    <div className="flex flex-col items-center bg-grey-50 w-fit py-6 px-36 rounded-2xl">
      <p>{bannerString}</p>
      <ApplyButton status={status} applicationURL={applicationURL} />
    </div>
  );
}

const ApplyButton = (props: {
  status: ApplicationPeriodStatus;
  applicationURL: string;
  testid?: string;
}) => {
  const { status, applicationURL } = props;

  return (
    <Button
      type="button"
      onClick={() => window.open(applicationURL, "_blank")}
      className="bg-orange-100 text-grey-500 mt-2 basis-full items-center justify-center shadow-sm text-sm rounded md:h-12"
      data-testid={
        status === "during-application"
          ? "apply-button"
          : "view-requirements-button"
      }
    >
      {status === "during-application" ? "Apply now!" : "Check requirements"}
    </Button>
  );
};

export default ApplicationsCountdownBanner;
