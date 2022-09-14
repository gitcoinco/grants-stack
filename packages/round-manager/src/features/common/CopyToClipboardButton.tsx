import { Button } from "./styles";
import { ClipboardCopyIcon } from "@heroicons/react/solid";

type CopyToClipboardType = {
  textToCopy: string;
  clipboardText?: string;
  styles?: string;
  iconStyle?: string;
};

export default function CopyToClipboardButton(props: CopyToClipboardType) {
  return (
    <Button
      type="button"
      className={`inline-flex ${props.styles}`}
      onClick={async () =>
        await navigator.clipboard.writeText(props.textToCopy)
      }
    >
      <ClipboardCopyIcon className={props.iconStyle} aria-hidden="true" />
      {props.clipboardText ? props.clipboardText : "Copy to clipboard"}
    </Button>
  );
}
