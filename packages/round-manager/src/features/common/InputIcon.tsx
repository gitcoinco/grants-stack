import { InputType } from "../api/types";
import { MdOutlineShortText, MdCheckBox, MdArrowDropDownCircle, MdRadioButtonChecked, MdAccountBalanceWallet, MdNotes } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";

type InputIconProps = {
  type?: InputType | string;
  className?: string;
  size?: number;
};

export const InputIcon = ({ type, className, size }: InputIconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style = {
    fontSize: size ? size : 20
  }
  const icons: any = {
    "email": <AiOutlineMail style={style} />,
    "address": <MdAccountBalanceWallet style={style} />,
    "short-answer": <MdOutlineShortText style={style} />,
    "paragraph": <MdNotes style={style} />,
    "multiple-choice": <MdRadioButtonChecked style={style} />,
    "checkbox": <MdCheckBox style={style} />,
    "dropdown": <MdArrowDropDownCircle style={style} />,
  } as const;

  return (
    <span className={`flex items-center ${className}`}>
      {type && type in icons ? icons[type] : <></>}
    </span>
  );
};
