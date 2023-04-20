import { Dispatch, SetStateAction } from "react";
import { RoundOverview } from "../api/rounds";
import SearchInput from "../common/SearchInput";
import RoundCard from "./RoundCard";

const SortFilter = () => {
  return (
    <div>
      <span className="text-sm mx-auto md:ml-8">Sort by</span>
      <select
        className="border-0 cursor-pointer text-violet-400 text-sm"
        placeholder="Select Filter"
      >
        <option>Round End (Earliest)</option>
        <option>Round Start (Earliest)</option>
      </select>
    </div>
  );
};

const ActiveRoundsSection = (props: {
  setSearchQuery: Dispatch<SetStateAction<string>>;
  roundOverview: RoundOverview[];
  searchQuery: string;
}) => {
  return (
    <div className="my-6">
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex flex-col mt-4">
          <p className="text-grey-400 text-2xl">
            All Active Rounds ({props.roundOverview?.length.toString()})
          </p>
          <p className="text-grey-400 text-sm mb-4 mt-2">
            Rounds that are ongoing
          </p>
        </div>

        <div className="flex flex-col lg:flex-row my-auto">
          <SearchInput
            searchQuery={props.searchQuery}
            onChange={props.setSearchQuery}
          />
          <SortFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-6">
        {props.roundOverview?.map((round, index) => {
          return <RoundCard key={index} round={round} />;
        })}
      </div>
    </div>
  );
};

export default ActiveRoundsSection;
