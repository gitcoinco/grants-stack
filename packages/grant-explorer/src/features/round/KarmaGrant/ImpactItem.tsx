import {
  Box,
  Divider,
  Flex,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import GitcoinLogo from "../../../assets/gitcoinlogo-white.svg";
import { renderToHTML } from "common/src/markdown";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ExpandableGrid } from "../../common/ExpandableGrid";
import { dateFromMs } from "../../api/utils";
import { useEffect, useState, FC } from "react";
import { IGapImpact, getGapProjectImpactUrl } from "../../api/gap";

import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useEnsName } from "wagmi";

interface ImpactItemProps {
  impact: IGapImpact;
  url: string;
}

const EthereumAddressToENSName: FC<{
  address: `0x${string}`;
  shouldTruncate?: boolean;
}> = ({ address, shouldTruncate = true }) => {
  const { data: ensName } = useEnsName({
    address: address,
  });
  const lowerCasedAddress = address.toLowerCase();
  const addressToDisplay = shouldTruncate
    ? lowerCasedAddress?.slice(0, 6) + "..." + lowerCasedAddress?.slice(-6)
    : lowerCasedAddress;

  return <span className="font-body">{ensName || addressToDisplay}</span>;
};

export const ImpactItem: React.FC<ImpactItemProps> = ({ impact }) => {
  return (
    <tr className="" key={impact.uid}>
      <td
        className={
          "py-4 border-t border-t-black pr-6 px-6 max-w-[420px] max-sm:min-w-[200px] text-black "
        }
      >
        <Link
          target="_blank"
          href={getGapProjectImpactUrl(impact.refUID)}
          className="text-lg font-semibold align-top"
        >
          {impact.data?.work}
        </Link>
      </td>
      <td
        className={
          "py-4 border-t border-t-black pr-6 px-6 max-w-[420px] max-sm:min-w-[200px] align-top"
        }
      >
        <div className="mb-2">{impact.data?.impact}</div>
        <Link target="_blank" href={impact.data?.proof}>
          {impact.data?.proof}
        </Link>
      </td>
      <td
        className={
          "py-4 border-t border-t-black pr-6 px-6 max-w-[420px] max-sm:min-w-[200px] px-3 align-top pr-5"
        }
      >
        <div className="flex flex-row gap-3 items-center justify-start ml-3 min-w-max max-w-full">
          {impact.verified.length ? (
            <div className="w-max max-w-full">
              {impact.verified.map((verification) => (
                <div className="flex flex-row gap-2 items-center justify-start">
                  <div className="bg-teal-100 flex gap-2 rounded-full px-2 text-xs items-center font-modern-era-medium text-teal-500">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </div>
                  <span className="text-xs">
                    by{" "}
                    <EthereumAddressToENSName address={verification.attester} />
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </td>
      <td
        className={
          "py-4 border-t border-t-black pr-6 px-6 max-w-[420px] max-sm:min-w-[200px] border-l border-l-zinc-400"
        }
      >
        <p className="w-36 max-w-max text-gray-500 text-sm font-medium ">
          {impact.data?.startedAt
            ? dateFromMs(impact.data?.startedAt * 1000)
            : "N/A"}
          {" → "}
          {impact.data?.completedAt
            ? dateFromMs(impact.data?.completedAt * 1000)
            : "N/A"}
        </p>
      </td>
    </tr>
  );
};
