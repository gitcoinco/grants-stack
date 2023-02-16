import { InputType } from "../api/types";
import { MdMail, MdOutlineShortText, MdCheckBox, MdArrowDropDownCircle, MdRadioButtonChecked, MdAccountBalanceWallet, MdNotes } from "react-icons/md";

type InputIconProps = {
  type?: InputType | string;
  className?: string;
  color?: string;
};

export const InputIcon = ({ type, className, color }: InputIconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons: any = {
    "email": <MdMail color={color} style={{ fontSize: 20 }} />,
    "wallet-address": <MdAccountBalanceWallet color={color} style={{ fontSize: 20 }} />,
    "short-answer": <MdOutlineShortText color={color} style={{ fontSize: 20 }} />,
    "paragraph": <MdNotes color={color} style={{ fontSize: 20 }} />,
    "multiple-choice": <MdRadioButtonChecked color={color} style={{ fontSize: 20 }} />,
    "checkbox": <MdCheckBox color={color} style={{ fontSize: 20 }} />,
    "dropdown": <MdArrowDropDownCircle color={color} style={{ fontSize: 20 }} />,
  } as const;

  return (
    <span className={`flex items-center mx-3 ${className}`}>
      {type && type in icons ? icons[type] : <></>}
    </span>
  );
};
