import { Input } from "common/src/styles";
import { Dispatch, SetStateAction } from "react";
import { ReactComponent as Search } from "../../assets/search-grey.svg";

const SearchInput = (props: {
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
