import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/solid";

const ActionPanel = () => {
  return (
    <div className="border border-transparent p-2 my-4 bg-blue-100 rounded-2xl">
      <div className="flex flex-col">
        <ul className="flex flex-col justify-center space-x-4">
          <li className="flex flex-row items-center justify-start my-2">
            <ExclamationCircleIcon className="h-5 w-5 inline ml-4 mr-2 text-gray-500" />
            <span className="text-gray-500 font-normal font-sans">Actions to be taken</span>
          </li>
          {/* todo: map the actions ... */}
          <li className="flex flex-row items-center justify-start my-2">
            <CheckIcon className="h-5 w-5 inline mr-2 text-green-500" />
            <span className="text-gray-500 font-normal font-sans">Action 1</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ActionPanel;
