import { formatUnits } from "viem";
import { Badge } from "../common/styles";

type RoundCardStatProps = {
  matchAmount: string;
  token: string;
  tokenDecimals: number;
};

export function RoundMatchAmountBadge({
  matchAmount,
  token,
  tokenDecimals,
}: RoundCardStatProps) {
  const matchAmountNormalized = formatUnits(BigInt(matchAmount), tokenDecimals);
  return (
    <Badge disabled={!matchAmountNormalized}>
      <span className="mr-1" data-testid="match-amount">
        {matchAmountNormalized.toLocaleString()}
      </span>
      <span data-testid="match-token">{token} match</span>
    </Badge>
  );
}
