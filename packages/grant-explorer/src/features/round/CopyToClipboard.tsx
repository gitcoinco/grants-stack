import React, { useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { truncate } from "../common/utils/truncate";
import { isAddress } from "viem";

const CopyToClipboard = ({ text }: { text: string | undefined }) => {
  const [copied, setCopied] = useState(false);
  const copyText = () => {
    navigator.clipboard
      .writeText(text || "")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
  };

  return (
    <div onClick={copyText} className="flex" style={{ cursor: "pointer" }}>
      {isAddress(text || "") ? truncate(text) : text}
      {copied ? (
        <CheckCircleIcon
          aria-hidden="true"
          className="ml-1 w-5 text-blue-500"
        />
      ) : (
        <DocumentDuplicateIcon
          aria-hidden="true"
          className="ml-1 w-5 text-blue-500"
        />
      )}
    </div>
  );
};

export default CopyToClipboard;
