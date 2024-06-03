import { ApplicationStatus } from "./types";
import { useEffect, useState } from "react";
import { Address, getAddress } from "viem";
import { Contribution, useDataLayer } from "data-layer";
import { dateToEthereumTimestamp } from "common";

export type RoundProject = {
  id: string;
  status: ApplicationStatus;
  payoutAddress: string;
};

export type ContributionHistoryState =
  | { type: "loading" }
  | {
      type: "loaded";
      data: { chainIds: number[]; data: Contribution[] };
    }
  | { type: "error"; error: string };

export const useContributionHistory = (
  chainIds: number[],
  rawAddress: string
) => {
  const [state, setState] = useState<ContributionHistoryState>({
    type: "loading",
  });
  const dataLayer = useDataLayer();

  useEffect(() => {
    const fetchContributions = async () => {
      let address: Address = "0x";
      try {
        address = getAddress(rawAddress.toLowerCase());
      } catch (e) {
        return Promise.resolve({
          chainIds,
          error: "Invalid address",
          data: [],
        });
      }

      const contributions = await dataLayer.getDonationsByDonorAddress({
        address,
        chainIds,
      });

      setState({
        type: "loaded",
        data: {
          chainIds: chainIds,
          data: contributions.map((contribution) => ({
            ...contribution,
            timestamp: dateToEthereumTimestamp(
              new Date(contribution.timestamp)
            ).toString(),
          })),
        },
      });
    };

    fetchContributions();
  }, [chainIds, dataLayer, rawAddress]);

  return state;
};
