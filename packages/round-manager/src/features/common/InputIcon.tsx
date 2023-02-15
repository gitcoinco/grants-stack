import { CheckCircleIcon, MailIcon, CubeTransparentIcon, MenuAlt4Icon, MenuAlt2Icon, DuplicateIcon, ArrowCircleDownIcon } from "@heroicons/react/outline";
import { InputType } from "../api/types";

type InputIconProps = {
  type?: InputType | string;
  className?: string;
};

export const InputIcon = ({ type, className }: InputIconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons: any = {
    "email": <MailIcon />,
    "address": <CubeTransparentIcon />,
    "short-answer": <MenuAlt4Icon />,
    "paragraph": <MenuAlt2Icon />,
    "multiple-choice": <DuplicateIcon />,
    "checkbox": <CheckCircleIcon />,
    "dropdown": <ArrowCircleDownIcon />,
  } as const;

  return (
    <span className={`h-4 w-4 flex items-center ${className}`}>
      {type && type in icons ? icons[type] : <></>}
    </span>
  );
};
