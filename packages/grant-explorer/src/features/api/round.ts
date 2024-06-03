import { ApplicationStatus } from "./types";
import { useEffect, useState } from "react";
import { Address, Hex, getAddress } from "viem";
import { Contribution, useDataLayer } from "data-layer";
import { getPublicClient } from "@wagmi/core";

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
          data: contributions,
        },
      });

    };

    fetchContributions();
  }, [chainIds, dataLayer, rawAddress]);

  return state;
};
