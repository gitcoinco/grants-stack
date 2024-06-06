import { useCountdown } from "../../hooks/useCountdown";

export function CountdownBanner(props: { title: string; targetDate: Date }) {
  const { title, targetDate } = props;

  const { days, hours, minutes } = useCountdown(targetDate);

  const daysString = `${days} ${days === 1 ? "day" : "days"}`;
  const hoursString = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const minutesString = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;

  return (
    <div className="bg-green-50 p-8 rounded-2xl">
      <p className="text-xl mb-2 font-mono tracking-tighter">{title}</p>
      <p>
        <span>{`${daysString} ${hoursString} ${minutesString}`}</span>
      </p>
    </div>
  );
}
