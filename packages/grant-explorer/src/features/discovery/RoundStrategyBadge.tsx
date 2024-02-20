import {
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
  ROUND_PAYOUT_DIRECT_OLD,
  ROUND_PAYOUT_MERKLE_OLD,
  RoundPayoutType,
} from "common";
import { getRoundType } from "../api/utils";
import { Badge } from "../common/styles";

type Props = { strategyName: RoundPayoutType };

const colorOptions = {
  [ROUND_PAYOUT_MERKLE_OLD]: "blue",
  [ROUND_PAYOUT_DIRECT_OLD]: "yellow",
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
