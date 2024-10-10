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
      className={`inline-flex text-black w-30 justify-center text-sm font-semibold bg-white border border-grey-100 ${props.styles}`}
      onClick={async () => {
        setActive(true);
        setTimeout(() => setActive(false), 1000);

        await navigator.clipboard.writeText(props.textToCopy);
      }}
    >
      <LinkIcon className={`mt-1 ${props.iconStyle}`} aria-hidden="true" />
      <span className="ml-1">
        {active ? "Link Copied" : "Share Profile"}
      </span>
    </Button>
  );
}
