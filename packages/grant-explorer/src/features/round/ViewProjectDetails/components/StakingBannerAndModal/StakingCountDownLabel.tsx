import { TimeRemaining } from "./types";

const generateCountDownLabel = ({
  days,
  hours,
  minutes,
  limitMinutes,
}: {
  days: number;
  hours: number;
  minutes: number;
  limitMinutes: number;
}) => {
  if (days > 0) {
    const dayText = days === 1 ? "day" : "days";
    if (hours === 0) {
      return `${days} ${dayText}`;
    }
    const hourText = hours === 1 ? "hour" : "hours";
    return `${days} ${dayText}, ${hours} ${hourText}`;
  } else if (hours > 0) {
    const hourText = hours === 1 ? "hour" : "hours";
    if (minutes === 0) {
      return `${hours} ${hourText}`;
    }
    const minuteText = minutes === 1 ? "minute" : "minutes";
    return `${hours} ${hourText}, ${minutes} ${minuteText}`;
  } else if (minutes >= limitMinutes && minutes > 0) {
    const minuteText = minutes === 1 ? "minute" : "minutes";
    return `${minutes} ${minuteText}`;
  } else if (minutes > 0) {
    return "in a few minutes";
  } else {
    return "in less than a minute";
  }
};

export const StakingCountDownLabel = ({
  label = "Staking begins in",
  timeLeft,
  limitMinutes = 3,
}: {
  label?: string;
  timeLeft: TimeRemaining;
  limitMinutes?: number;
}) => {
  if (timeLeft.totalMilliseconds <= 0) {
    return null;
  }
  return (
    <div className="py-4 px-8 rounded-2xl text-white bg-[#22635A] font-sans text-lg font-medium flex flex-row xl:flex-col items-center gap-1">
      <div className="whitespace-nowrap">{label}</div>
      <div className="whitespace-nowrap">
        {generateCountDownLabel({ ...timeLeft, limitMinutes })}
      </div>
    </div>
  );
};
