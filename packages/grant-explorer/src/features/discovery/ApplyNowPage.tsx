import { useState } from "react";
import { RoundOverview } from "../api/rounds";
import SearchInput, { SortFilterDropdown } from "../common/SearchInput";

type ApplyNowPageProps = {
  rounds: RoundOverview[];
};

const ApplyNowPage = (props: ApplyNowPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  console.log("props: ", props);

  return (
    <div>
      <p className="text-grey-400 text-2xl">Apply Now</p>
      <div className="flex flex-col lg:flex-row justify-between">
        <p className="text-grey-400 mb-2 lg:mb-4 mt-2">
          Rounds currently accepting applications
        </p>
        <a className="cursor-pointer mr-1 text-violet-400 text-sm" href="/">
          {`View All (${props.rounds.length})`}
        </a>
      </div>
      <div className="flex flex-col lg:flex-row my-auto">
        <SearchInput searchQuery={searchQuery} onChange={setSearchQuery} />
        <SortFilterDropdown
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: { target: { value: any } }) =>
            console.log(e.target.value)
          }
        />
      </div>
      {/* todo: */}
    </div>
  );
};

export default ApplyNowPage;
