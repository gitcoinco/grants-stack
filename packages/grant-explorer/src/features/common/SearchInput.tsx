import { Input } from "common/src/styles";
import { Dispatch, SetStateAction } from "react";
import { ReactComponent as Search } from "../../assets/search-grey.svg";

export type SortFilterDropdownProps = {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export const SortFilterDropdown = (props: SortFilterDropdownProps) => {
  return (
    <div>
      <span className="text-sm mx-auto md:ml-8">
        Sort <span className="hidden md:inline mr-1">by</span>
      </span>
      <select
        className="border-0 cursor-pointer text-violet-400 text-sm"
        placeholder="Select Filter"
        onChange={props.onChange}
      >
        <option value="round_asc">Round End (Earliest)</option>
        <option value="round_desc">Round Start (Earliest)</option>
      </select>
    </div>
  );
};

export type GrantRoundTypeFilterDropdownProps = {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export const GrantRoundTypeFilterDropdown = (
  props: GrantRoundTypeFilterDropdownProps
) => {
  return (
    <div>
      <span className="text-sm mx-auto md:ml-8">
        Filter <span className="hidden md:inline mr-1">by</span>
      </span>
      <select
        className="border-0 cursor-pointer text-violet-400 text-sm"
        placeholder="All"
        onChange={props.onChange}
      >
        <option value="round_type_all">All Round Types</option>
        <option value="round_type_quadratic">Quadratic Funding</option>
        <option value="round_type_direct">Direct Grant</option>
      </select>
    </div>
  );
};

export const SearchInput = (props: {
  searchQuery: string;
  onChange: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className="relative">
      <Search className="absolute h-4 w-4 mt-3 ml-3" />
      <Input
        className="w-full lg:w-64 h-8 rounded-full pl-10 active:border-violet-400"
        type="text"
        placeholder="Search..."
        value={props.searchQuery}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
