/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChainId } from "common";
import { Dispatch, SetStateAction, useState } from "react";
import { RoundOverview } from "../api/rounds";
import SearchInput, { SortFilterDropdown } from "../common/SearchInput";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";

type ActiveRounds = {
  isLoading: boolean;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  roundOverview?: RoundOverview[];
  searchQuery: string;
};

const ActiveRoundsSection = (props: ActiveRounds) => {
  const activeRoundsCount = props.roundOverview?.length ?? 0;
  const [order, setOrder] = useState<string>("round_asc");

  function sortRoundsByTime(rounds: RoundOverview[], order: string) {
    // If order is round_asc, sort in ascending order. Otherwise, sort in descending order.
    const isAscending = order === "round_asc";

    // Use the sort method to sort the rounds array based on the start or end time
    rounds.sort((a: RoundOverview, b: RoundOverview) => {
      const timeA = isAscending
        ? Number(a.roundStartTime)
        : Number(a.roundEndTime);
      const timeB = isAscending
        ? Number(b.roundStartTime)
        : Number(b.roundEndTime);
      return timeA - timeB;
    });

    // Return the sorted array
    return rounds;
  }

  return (
    <div className="my-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-col mt-4 justify-items-center">
          <p className="text-grey-400 text-2xl">
            All Active Rounds{" "}
            {activeRoundsCount > 0 ? `(${activeRoundsCount})` : null}
          </p>
          <p className="text-grey-400 text-sm mb-4 mt-2">
            Rounds that are ongoing
          </p>
        </div>
        {!props.isLoading && activeRoundsCount > 0 ? (
          <div className="flex flex-col lg:flex-row my-auto">
            <SearchInput
              searchQuery={props.searchQuery}
              onChange={props.setSearchQuery}
            />
            <SortFilterDropdown
              onChange={(e: { target: { value: any } }) =>
                setOrder(e.target.value)
              }
            />
          </div>
        ) : null}
      </div>
      <div>
        {props.isLoading ? (
          <div className="flex flex-col lg:flex-row my-auto">
            <Spinner />
          </div>
        ) : null}
        {activeRoundsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 2xl:grid-cols-4">
            {sortRoundsByTime(props.roundOverview ?? [], order)
              .filter((round) => (round.projects?.length ?? 0) > 0)
              // .filter((round) => round.chainId === "PGN_TESTNET")
              .map((round, index) => {
                return <RoundCard key={index} round={round} />;
              })}
          </div>
        ) : !props.isLoading ? (
          <NoRounds type={"active"} />
        ) : null}
      </div>
    </div>
  );
};

export default ActiveRoundsSection;
