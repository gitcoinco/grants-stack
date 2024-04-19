import { Button } from "common/src/styles";
import { LinkIcon } from "@heroicons/react/24/solid";
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
      className={`inline-flex bg-[#FFD9CD] text-black w-30 justify-center font-mono ${
        active && "animate-[peachTransition_20s_ease-in]"
      } ${props.styles}`}
      onClick={async () => {
        setActive(true);
        setTimeout(() => setActive(false), 1000);

        await navigator.clipboard.writeText(props.textToCopy);
      }}
    >
      <LinkIcon className={props.iconStyle} aria-hidden="true" />
      {active ? "Link Copied" : "Share Profile"}
    </Button>
  );
}
