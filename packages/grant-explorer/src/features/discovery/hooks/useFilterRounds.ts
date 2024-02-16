import { Chain } from "wagmi/chains";
import { useRounds } from "../../api/rounds";
import { createRoundsStatusFilter } from "../utils/createRoundsStatusFilter";
import { SWRResponse } from "swr";
import {
  OrderByRounds,
  RoundGetRound,
  RoundsQueryVariables,
  TimeFilterVariables,
} from "data-layer";
import { isEmpty } from "lodash";
import { ROUND_PAYOUT_MERKLE } from "common";
import { useMemo } from "react";

export type StrategyName =
  | ""
  | "allov1.QF"
  | "allov1.Direct"
  | "MERKLE"
  | "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
  | "allov2.MicroGrantsStrategy"
  | "allov2.MicroGrantsGovStrategy"
  | "allov2.SQFSuperFluidStrategy";

export type RoundFilterParams = {
  type: StrategyName;
  status: string;
  network: string;
};

export type RoundSortParams = {
  orderBy: OrderByRounds;
};

export type RoundSelectionParams = RoundSortParams & RoundFilterParams;

export type RoundSortUiOption = {
  label: string;
  orderBy: OrderByRounds;
};

export type RoundFilterUiOption = {
  label: string;
  value: string;
  hide?: boolean;
  children?: RoundFilterUiOption[];
};

export enum RoundStatus {
  active = "active",
  taking_applications = "taking_applications",
  finished = "finished",
  ending_soon = "ending_soon",
}

export const ACTIVE_ROUNDS_FILTER: RoundSelectionParams = {
  orderBy: "MATCH_AMOUNT_DESC",
  status: RoundStatus.active,
  type: ROUND_PAYOUT_MERKLE,
  network: "",
};

export const ROUNDS_ENDING_SOON_FILTER: RoundSelectionParams & {
  first: number;
} = {
  first: 3,
  orderBy: "DONATIONS_END_TIME_ASC",
  type: "",
  network: "",
  status: RoundStatus.ending_soon,
};

export const useFilterRounds = (
  where: RoundSelectionParams,
  chains: Chain[]
): SWRResponse<RoundGetRound[]> => {
  const chainIds =
    where.network === undefined || where.network.trim() === ""
      ? chains.map((c) => c.id)
      : where.network.split(",").map(parseInt);

  const statusFilter = useMemo(
    () => createRoundsStatusFilter(where.status),
    [where.status]
  );

  const strategyNames =
    where.type === undefined || where.type.trim() === ""
      ? []
      : where.type.split(",");
  const filter = createRoundWhereFilter(statusFilter, strategyNames);
  const orderBy =
    where.orderBy === undefined ? "CREATED_AT_BLOCK_DESC" : where.orderBy;
  const vars = { orderBy, filter };
  return useRounds(vars, chainIds);
};

const createRoundWhereFilter = (
  statusFilter: TimeFilterVariables[],
  strategyNames: string[]
): RoundsQueryVariables["filter"] => {
  return {
    and: [
      // Find rounds that match both statusFilter and round type
      { or: statusFilter },
      {
        ...(strategyNames.length > 0 && {
          or: {
            strategyName: { in: strategyNames },
          },
        }),
      },
    ].filter((prop) => !isEmpty(prop)),
  };
};

export const getRoundSelectionParamsFromUrlParams = (
  params: URLSearchParams
): RoundSelectionParams => {
  // TODO parse url params explicitly
  return Object.fromEntries(params) as RoundSortParams & RoundFilterParams;
};
