import { TimeLeft, getTimeLeft, parseTimeLeftString } from "../api/utils";
import { Badge } from "../common/styles";

function RoundStartCountdownBadge(props: { targetDate: Date }) {
  const { targetDate } = props;

  const targetDateString = Math.round(targetDate.getTime() / 1000).toString();

  const timeLeft: TimeLeft = getTimeLeft(targetDateString);
  const timeLeftString: string = parseTimeLeftString(timeLeft);

  const badgeString = `Donations start in ${timeLeftString}`;

  return (
    <Badge
      color="rainbow"
      rounded="full"
      className="flex-shrink-0 px-2.5 font-modern-era-bold"
      data-testid="donations-countdown-badge"
    >
      {badgeString}
    </Badge>
  );
}

export default RoundStartCountdownBadge;
