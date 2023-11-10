import { Badge } from "../common/styles";

type Props = {
  roundEndsIn?: number;
  applicationsEndsIn?: number;
};

const style = { rounded: "full", className: "absolute top-3 right-3" } as const;

export function RoundTimeBadge({ roundEndsIn, applicationsEndsIn }: Props) {
  if (roundEndsIn !== undefined && roundEndsIn < 0) {
    return (
      <Badge color="orange" {...style}>
        Round ended
      </Badge>
    );
  }
  if (applicationsEndsIn !== undefined && applicationsEndsIn > 0) {
    return (
      <Badge color="green" {...style}>
        Apply!
      </Badge>
    );
  }
  return null;
}
