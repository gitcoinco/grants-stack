import { InputType } from "../api/types";
import { MdOutlineShortText, MdCheckBox, MdArrowDropDownCircle, MdRadioButtonChecked, MdAccountBalanceWallet, MdNotes } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";

type InputIconProps = {
  type?: InputType | string;
  className?: string;
  color?: string;
  size?: number;
};

export const InputIcon = ({ type, className, color, size }: InputIconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons: any = {
    "email": <AiOutlineMail color={color} style={{ fontSize: size ? size: 20 }} />,
    "wallet-address": <MdAccountBalanceWallet color={color} style={{ fontSize: size ? size: 20 }} />,
    "short-answer": <MdOutlineShortText color={color} style={{ fontSize: size ? size: 20 }} />,
    "paragraph": <MdNotes color={color} style={{ fontSize: size ? size: 20 }} />,
    "multiple-choice": <MdRadioButtonChecked color={color} style={{ fontSize: size ? size: 20 }} />,
    "checkbox": <MdCheckBox color={color} style={{ fontSize: size ? size: 20 }} />,
    "dropdown": <MdArrowDropDownCircle color={color} style={{ fontSize: size ? size: 20 }} />,
  } as const;

  return (
    <span className={`flex items-center ${className}`}>
      {type && type in icons ? icons[type] : <></>}
    </span>
  );
};
