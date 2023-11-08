import { Badge } from "../common/styles";

type Props = {
  roundEndsIn?: number;
  applicationsEndIn?: number;
};

const style = { rounded: "full", className: "absolute top-3 right-3" } as const;

export function RoundTimeBadge({ roundEndsIn, applicationsEndIn }: Props) {
  if (roundEndsIn && roundEndsIn < 0) {
    return (
      <Badge color="orange" {...style}>
        Round ended
      </Badge>
    );
  }
  if (applicationsEndIn && applicationsEndIn > 0) {
    return (
      <Badge color="green" {...style}>
        Apply!
      </Badge>
    );
  }
  return null;
}
