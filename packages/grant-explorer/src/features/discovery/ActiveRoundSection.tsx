/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from "react";
import { RoundOverview } from "../api/rounds";
import SearchInput, { SortFilterDropdown } from "../common/SearchInput";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";

type ActiveRounds = {
  isLoading: boolean;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  roundOverview: RoundOverview[];
  searchQuery: string;
};

const ActiveRoundsSection = (props: ActiveRounds) => {
  const activeRoundsCount = props.roundOverview.length;

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
                console.log(e.target.value)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {props.roundOverview.map((round, index) => {
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
