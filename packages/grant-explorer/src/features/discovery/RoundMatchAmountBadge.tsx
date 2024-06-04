import { formatUnits, getAddress, zeroAddress } from "viem";
import { Badge } from "../common/styles";
import { useToken } from "wagmi";
import { getPayoutToken } from "../api/utils";

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
  const { data } = useToken({
    address: getAddress(tokenAddress),
    chainId: Number(chainId),
    enabled: tokenAddress !== zeroAddress,
  });
  const nativePayoutToken = getPayoutToken(tokenAddress, chainId);

  const symbol = data?.symbol ?? nativePayoutToken?.code ?? "ETH";
  const decimals = data?.decimals ?? nativePayoutToken?.decimals ?? 18;

  const matchAmountNormalized = formatUnits(BigInt(matchAmount), decimals);

  return (
    <Badge disabled={!matchAmountNormalized}>
      <span className="mr-1" data-testid="match-amount">
        {formatter.format(Number(matchAmountNormalized))}
      </span>
      <span data-testid="match-token">{symbol} match</span>
    </Badge>
  );
}
