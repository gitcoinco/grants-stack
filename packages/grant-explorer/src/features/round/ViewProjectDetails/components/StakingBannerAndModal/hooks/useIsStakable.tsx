import { useMemo } from "react";

// TODO: either from metadata or from env value
// ONLY GITCOIN ROUNDS OF GG23
const STAKABLE_ROUNDS: Array<{ chainId: number; roundId: string }> = [
  { chainId: 42161, roundId: "863" },
  { chainId: 42161, roundId: "865" },
  { chainId: 42161, roundId: "867" },
  { chainId: 11155111, roundId: "709" },
  { chainId: 11155111, roundId: "710" },
];

export const useIsStakable = ({
  chainId,
  roundId,
}: {
  chainId: number;
  roundId: string;
}) => {
  const isStakable = useMemo(() => {
    return STAKABLE_ROUNDS.some(
      (round) => round.chainId === chainId && round.roundId === roundId
    );
  }, [chainId, roundId]);

  return isStakable;
};
