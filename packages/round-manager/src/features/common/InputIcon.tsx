import { CheckCircleIcon, MailIcon, CubeTransparentIcon, MenuAlt4Icon, MenuAlt2Icon, DuplicateIcon, ArrowCircleDownIcon } from "@heroicons/react/outline";
import { InputType } from "../api/types";

type InputIconProps = {
  type: InputType;
  className?: string;
};


export const InputIcon = ({ type, className }: InputIconProps) => {
  const icons: any = {
    'email': <MailIcon />,
    'address': <CubeTransparentIcon />,
    'short-answer': <MenuAlt4Icon />,
    'paragraph': <MenuAlt2Icon />,
    'multiple-choice': <DuplicateIcon />,
    'checkbox': <CheckCircleIcon />,
    'dropdown': <ArrowCircleDownIcon />,
  };

  return (
    <span className={`h-4 w-4 flex items-center ${className}`}>
      {icons[type] || <MenuAlt4Icon />}
    </span>
  );
};