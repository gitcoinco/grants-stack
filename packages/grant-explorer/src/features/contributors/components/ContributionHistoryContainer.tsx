import { useEnsName } from "wagmi";
import { isAddress } from "viem";

import { ContributionHistory } from "./ContributionHistory";

import { useContributionsByDonor } from "../hooks/useContributionsByDonor";
import { ContributionHistoryError } from "./ContributionHistoryError";

export function ContributionHistoryContainer(props: {
  address: string;
  chainIds: number[];
}) {
  const { isLoading, isError, error, data } = useContributionsByDonor(
    props.chainIds,
    props.address
  );

  const { data: ensName } = useEnsName({
    /* If props.address is an ENS name, don't pass in anything, as we already have the ens name*/
    address: isAddress(props.address) ? props.address : undefined,
    chainId: 1,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    console.error("Error", error);
    return (
      <ContributionHistoryError address={props.address} ensName={ensName} />
    );
  }

  return (
    <ContributionHistory
      contributionsData={data}
      address={props.address}
      ensName={ensName}
    />
  );
}
