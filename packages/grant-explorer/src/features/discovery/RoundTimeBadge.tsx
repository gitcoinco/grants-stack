import { Badge } from "../common/styles";

interface RoundTimeBadgeProps {
  roundPhase: "active" | "accepting-applications" | "ended" | undefined;
}

const STYLE = { rounded: "full", className: "absolute top-3 right-3" } as const;

export const RoundTimeBadge: React.FC<RoundTimeBadgeProps> = ({
  roundPhase,
}) => {
  if (roundPhase === "accepting-applications") {
    return (
      <Badge color="green" {...STYLE}>
        Apply!
      </Badge>
    );
  } else if (roundPhase === "ended") {
    return (
      <Badge color="orange" {...STYLE}>
        Round ended
      </Badge>
    );
  } else {
    return null;
  }
};
