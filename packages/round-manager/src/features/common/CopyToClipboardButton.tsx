import { Button } from "./styles";
import { ClipboardCopyIcon } from "@heroicons/react/solid";
import { useState } from "react";

type CopyToClipboardType = {
  textToCopy: string;
  styles?: string;
  iconStyle?: string;
};

export default function CopyToClipboardButton(props: CopyToClipboardType) {

  const [active, setActive] = useState(false);

  return (

    <Button
      type="button"
      className={`inline-flex bg-violet-100 text-violet-600 ${active && 'animate-[violetTransition_20s_ease-in]'} ${props.styles}`}
      onClick={async () => {
        setActive(true);
        setTimeout(() => setActive(false), 1000);

        await navigator.clipboard.writeText(props.textToCopy);
      }}
    >
      <ClipboardCopyIcon className={props.iconStyle} aria-hidden="true" />
      { active ? "Copied to clipboard" : "Copy to clipboard" }
    </Button>
  );
}
