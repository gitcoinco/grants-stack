import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import { MdClose } from "react-icons/md";

// todo: next scope: add actions to the action panel

const ActionPanel = () => {
  return (
    <div className="mt-4 bg-blue-100 rounded-2xl">
      <div className="flex flex-col my-4 ml-5">
        <div className="flex flex-row items-center justify-start mt-4">
          <ExclamationCircleIcon className="h-5 w-5 inline mr-2 text-grey-500" />
          <span className="text-grey-500 font-normal font-sans">
            Actions to be taken
          </span>
        </div>
        <ul className="flex flex-row justify-start space-x-5">
          <li className="flex flex-row items-center justify-start my-2">
            <CheckIcon className="h-5 w-5 inline mr-2 text-green-500" />
            <span className="text-grey-500 font-normal font-sans">
              Action 1
            </span>
          </li>
          <li className="flex flex-row items-center justify-start my-2">
            <MdClose className="h-5 w-5 inline mr-2 text-red-500" />
            <span className="text-grey-500 font-normal font-sans">
              Action 2
            </span>
          </li>
        </ul>
      </div>
      <div className="bg-grey-50 p-2 rounded-b-2xl w-full">
        <div
          className="text-center font-mono font-medium cursor-pointer"
          onClick={() => {
            console.log("Record onchain");
          }}
        >
          Record onchain
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
