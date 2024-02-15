import { Chain } from "wagmi/chains";
import {
  __deprecated_RoundOverview,
  __deprecated_RoundsQueryVariables,
  __deprecated_TimestampVariables,
  useRounds,
} from "../../api/rounds";
import { createRoundsStatusFilter } from "../utils/createRoundsStatusFilter";
// FIXME: replace with ROUND_PAYOUT_MERKLE when we use the Indexer for the homepage
import { ROUND_PAYOUT_MERKLE_OLD } from "common";
import { SWRResponse } from "swr";

export type RoundFilterParams = {
  type: string;
  status: string;
  network: string;
};

export type RoundSortParams = {
  orderBy: RoundSortUiOption["orderBy"];
  orderDirection: RoundSortUiOption["orderDirection"];
};

export type RoundSelectionParams = RoundSortParams & RoundFilterParams;

export type RoundSortUiOption = {
  label: string;
  orderBy: __deprecated_RoundsQueryVariables["orderBy"] | "";
  orderDirection: __deprecated_RoundsQueryVariables["orderDirection"] | "";
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
  orderBy: "matchAmount",
  orderDirection: "desc",
  status: RoundStatus.active,
  type: ROUND_PAYOUT_MERKLE_OLD,
  network: "",
};

export const ROUNDS_ENDING_SOON_FILTER: RoundSelectionParams & {
  first: number;
} = {
  first: 3,
  orderBy: "roundEndTime",
  orderDirection: "asc",
  type: "",
  network: "",
  status: RoundStatus.ending_soon,
};

export const useFilterRounds = (
  filter: RoundSelectionParams,
  chains: Chain[]
): SWRResponse<__deprecated_RoundOverview[]> => {
  const chainIds =
    filter.network === undefined || filter.network.trim() === ""
      ? chains.map((c) => c.id)
      : filter.network.split(",").map(parseInt);
  const statusFilter = createRoundsStatusFilter(filter.status);
  const strategyNames =
    filter.type === undefined || filter.type.trim() === ""
      ? []
      : filter.type.split(",");
  const where = createRoundWhereFilter(statusFilter, strategyNames);
  const orderBy =
    filter.orderBy === undefined || filter.orderBy === ""
      ? "createdAt"
      : filter.orderBy;
  const orderDirection =
    filter.orderDirection === undefined || filter.orderDirection === ""
      ? "desc"
      : filter.orderDirection;

  return useRounds({ orderBy, orderDirection, where }, chainIds);
};

const createRoundWhereFilter = (
  statusFilter: __deprecated_TimestampVariables[],
  strategyNames: string[]
): __deprecated_RoundsQueryVariables["where"] => {
  const payoutStrategy = strategyNames.length
    ? strategyNames.map((strategyName) => ({ strategyName }))
    : undefined;

  return {
    and: [
      // Find rounds that match both statusFilter and round type
      { or: statusFilter },
      { payoutStrategy_: payoutStrategy ? { or: payoutStrategy } : undefined },
    ],
  };
};

export const getRoundSelectionParamsFromUrlParams = (
  params: URLSearchParams
): RoundSelectionParams => {
  // TODO parse url params explicitly
  const filter = Object.fromEntries(params) as RoundSortParams &
    RoundFilterParams;

  return filter;
};
