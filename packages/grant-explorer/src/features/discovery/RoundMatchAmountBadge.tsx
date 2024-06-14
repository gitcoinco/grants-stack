import { Hex, formatUnits } from "viem";
import { Badge } from "../common/styles";
import { getTokenByChainIdAndAddress } from "common";

type RoundCardStatProps = {
  matchAmount: string;
  tokenAddress: string;
  chainId: number;
};

const formatter = new Intl.NumberFormat();

export function RoundMatchAmountBadge({
  chainId,
  matchAmount,
  tokenAddress,
}: RoundCardStatProps) {
  const token = getTokenByChainIdAndAddress(chainId, tokenAddress as Hex);
  const matchAmountNormalized = formatUnits(BigInt(matchAmount), token.decimals);

  return (
    <Badge disabled={!matchAmountNormalized}>
      <span className="mr-1" data-testid="match-amount">
        {formatter.format(Number(matchAmountNormalized))}
      </span>
      <span data-testid="match-token">{token.code} match</span>
    </Badge>
  );
}
