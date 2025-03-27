import { useMemo } from "react";

// TODO: either from metadata or from env value
// ONLY GITCOIN ROUNDS OF GG23
const STAKABLE_ROUNDS: Array<{ chainId: number; roundId: string }> = [
  { chainId: 42161, roundId: "863" },
  { chainId: 42161, roundId: "865" },
  { chainId: 42161, roundId: "867" },
  // { chainId: 42220, roundId: "27" },
  // { chainId: 42220, roundId: "28" },
  // { chainId: 42220, roundId: "29" },
  // { chainId: 42220, roundId: "30" },
  // { chainId: 42220, roundId: "31" },
  // { chainId: 42220, roundId: "32" },
  // { chainId: 42220, roundId: "33" },
  // { chainId: 42220, roundId: "34" },
  // { chainId: 42220, roundId: "35" },
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
