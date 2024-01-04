import {
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
  RoundPayoutType,
} from "common";
import { getRoundType } from "../api/utils";
import { Badge } from "../common/styles";

type Props = { strategyName: RoundPayoutType };

const colorOptions = {
  [ROUND_PAYOUT_MERKLE]: "blue",
  [ROUND_PAYOUT_DIRECT]: "yellow",
} as const;

export function RoundStrategyBadge({ strategyName }: Props) {
  const color = colorOptions[strategyName];
  return (
    <Badge color={color} data-testid="round-badge">
      {getRoundType(strategyName) ?? "Unknown"}
    </Badge>
  );
}
