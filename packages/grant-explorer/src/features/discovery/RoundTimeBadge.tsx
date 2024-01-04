import { Badge } from "../common/styles";

interface RoundTimeBadgeProps {
  roundStates: Array<"active" | "accepting-applications" | "ended"> | undefined;
}

const STYLE = { rounded: "full", className: "absolute top-3 right-3" } as const;

export const RoundTimeBadge: React.FC<RoundTimeBadgeProps> = ({
  roundStates,
}) => {
  if (roundStates?.includes("accepting-applications")) {
    return (
      <Badge color="green" {...STYLE}>
        Apply!
      </Badge>
    );
  } else if (roundStates?.includes("ended")) {
    return (
      <Badge color="orange" {...STYLE}>
        Round ended
      </Badge>
    );
  } else {
    return null;
  }
};
