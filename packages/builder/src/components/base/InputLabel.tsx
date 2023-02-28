import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@chakra-ui/react";

export default function InputLabel({
  title,
  encrypted,
  hidden,
}: {
  title: string;
  encrypted: boolean;
  hidden: boolean;
}) {
  return (
    <span>
      <span className="mr-2">{title}</span>
      {hidden && (
        <Tooltip
          className="shrink ml-2 px-2 py-1"
          bg="purple.900"
          hasArrow
          label="This info will be hidden from your project’s Explorer page."
        >
          <span className="text-gray-400 text-xs mr-2 inline-block">
            <EyeSlashIcon className="w-3 h-3 inline-block mr-0.5 align-middle" />
            <span className="align-middle">Hidden</span>
          </span>
        </Tooltip>
      )}
      {!hidden && (
        <Tooltip
          className="shrink ml-2 px-2 py-1"
          bg="purple.900"
          hasArrow
          label="This info will be displayed on your project’s Explorer page once the round is live."
        >
          <span className="text-gray-400 text-xs mr-2 inline-block">
            <EyeIcon className="w-3 h-3 inline-block mr-0.5 align-middle" />
            <span className="align-middle">Public</span>
          </span>
        </Tooltip>
      )}
      {encrypted && (
        <Tooltip
          className="shrink ml-2 px-2 py-1"
          bg="purple.900"
          hasArrow
          label="This info will be encrypted and only visible to round operators."
        >
          <span className="text-gray-400 text-xs mr-2 inline-block">
            <LockClosedIcon className="w-3 h-3 inline-block mr-0.5 align-middle" />
            <span className="align-middle">Encrypted</span>
          </span>
        </Tooltip>
      )}
    </span>
  );
}
