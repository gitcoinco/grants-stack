/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useState } from "react";

import SearchInput, {
  GrantRoundTypeFilterDropdown,
  SortFilterDropdown,
} from "../common/SearchInput";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";
import { RoundGetRound } from "data-layer";

type ActiveRounds = {
  isLoading: boolean;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setRoundType: Dispatch<SetStateAction<string>>;
  roundOverview?: RoundGetRound[];
  searchQuery: string;
};

const ActiveRoundsSection = (props: ActiveRounds) => {
  const activeRoundsCount = props.roundOverview?.length ?? 0;
  const [order, setOrder] = useState<string>("round_asc");

  function sortRoundsByTime(rounds: RoundGetRound[], order: string) {
    // If order is round_asc, sort in ascending order. Otherwise, sort in descending order.
    const isAscending = order === "round_asc";

    // Use the sort method to sort the rounds array based on the start or end time
    rounds.sort((a: RoundGetRound, b: RoundGetRound) => {
      const timeA = isAscending
        ? Number(a.donationsStartTime)
        : Number(a.donationsEndTime);
      const timeB = isAscending
        ? Number(b.donationsStartTime)
        : Number(b.donationsEndTime);
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
            {activeRoundsCount > 0 && `(${activeRoundsCount})`}
          </p>
          <p className="text-grey-400 text-sm mb-4 mt-2">
            Rounds that are ongoing
          </p>
        </div>
        {!props.isLoading && activeRoundsCount > 0 && (
          <div className="flex flex-col lg:flex-row my-auto">
            <SearchInput
              searchQuery={props.searchQuery}
              onChange={props.setSearchQuery}
            />
            <GrantRoundTypeFilterDropdown
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                props.setRoundType(e.target.value);
              }}
            />
            <SortFilterDropdown
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setOrder(e.target.value)
              }
            />
          </div>
        )}
      </div>
      <div>
        {props.isLoading && (
          <div className="flex flex-col lg:flex-row my-auto">
            <Spinner />
          </div>
        )}
        {activeRoundsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 2xl:grid-cols-4">
            {sortRoundsByTime(props.roundOverview ?? [], order).map(
              (round, index) => {
                return (
                  <RoundCard round={round} index={index} roundType="active" />
                );
              }
            )}
          </div>
        ) : (
          <NoRounds type={"active"} />
        )}
      </div>
    </div>
  );
};

export default ActiveRoundsSection;
