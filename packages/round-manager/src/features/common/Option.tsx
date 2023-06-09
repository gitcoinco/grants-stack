import { XIcon } from "@heroicons/react/solid";

function Option({
  index,
  value,
  onChange,
  onDeleteOption,
}: {
  index: number;
  value: string;
  onChange: (event: React.ChangeEvent) => void;
  onDeleteOption: (index: number) => void;
}) {
  const renderDeleteOption = (index: number) => {
    return (
      <button onClick={() => onDeleteOption(index)}>
        <XIcon className="h-5 w-5 text-[#D03E63] ml-6" aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="flex flex-row mt-2">
      <span className="flex mt-2 ml-5 mr-[22px]">Option {index}</span>
      <input
        key={"option-" + index}
        className="border border-grey-100 rounded-sm ui-active:bg-violet-400 w-72"
        type="text"
        value={value}
        placeholder="Answer Option"
        onChange={onChange}
      />
      {renderDeleteOption(index)}
    </div>
  );
}

export default Option;
