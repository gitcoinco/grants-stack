import { RoundApplicationState } from "../../reducers/roundApplication";

interface ApplicationCardProps {
  application?: RoundApplicationState | undefined;
  roundId?: string | undefined;
}

export default function ApplicationCard({
  application,
  roundId,
}: ApplicationCardProps) {
  return (
    <div className="rounded border-2 border-gray-400 p-2">
      Status: {application && application[roundId!]?.status}
    </div>
  );
}
