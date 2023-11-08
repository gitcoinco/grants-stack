import { formatUnits, getAddress } from "viem";
import { Badge } from "../common/styles";
import { useToken } from "wagmi";
import { getPayoutToken } from "../api/utils";
import { ChainId } from "common";

type RoundCardStatProps = {
  matchAmount: string;
  token: string;
  chainId: ChainId;
};

export function RoundMatchAmountBadge({
  chainId,
  matchAmount,
  token,
}: RoundCardStatProps) {
  const { data } = useToken({
    address: getAddress(token),
    chainId: Number(chainId),
    enabled: !!token,
  });

  const nativePayoutToken = getPayoutToken(token, chainId);

  const symbol = data?.symbol ?? nativePayoutToken?.name ?? "ETH";
  const decimals = data?.decimals ?? nativePayoutToken?.decimal ?? 18;

  const matchAmountNormalized = formatUnits(BigInt(matchAmount), decimals);

  return (
    <Badge disabled={!matchAmountNormalized}>
      <span className="mr-1" data-testid="match-amount">
        {matchAmountNormalized.toLocaleString()}
      </span>
      <span data-testid="match-token">{symbol} match</span>
    </Badge>
  );
}