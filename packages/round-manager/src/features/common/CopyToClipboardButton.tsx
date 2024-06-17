import { LinkIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { CopyToClipboardType } from "./types";

export default function CopyToClipboardButton(props: CopyToClipboardType) {
  const [active, setActive] = useState(false);

  return (
    <span
      role="button"
      className={`inline-flex bg-white text-gray-500 w-50 rounded-lg justify-center cursor-pointer border-gray-100 py-2 px-3 hover:border-gray-200 hover:shadow-md ${
        active && "animate-[violetTransition_20s_ease-in]"
      } ${props.styles}`}
      onClick={async () => {
        setActive(true);
        setTimeout(() => setActive(false), 1000);

        await navigator.clipboard.writeText(props.textToCopy);
      }}
    >
      <LinkIcon className={props.iconStyle} aria-hidden="true" />
      {active ? "Link Copied" : "Round application"}
    </span>
  );
}
