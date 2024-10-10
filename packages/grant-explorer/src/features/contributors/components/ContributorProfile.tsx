import { useMemo } from "react";
import { useEnsAvatar } from "wagmi";
import { normalize } from "viem/ens";
import blockies from "ethereum-blockies";

import { AvatarWithTitle } from "./AvatarWithTitle";
import { truncateAddress } from "../utils/address";
import CopyToClipboardButton from "../../common/CopyToClipboardButton";

export function ContributorProfile({
  address,
  ensName,
}: {
  address: string;
  ensName?: string | null;
}) {
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
  });

  const addressLogo = useMemo(() => {
    return (
      ensAvatar ?? blockies.create({ seed: address.toLowerCase() }).toDataURL()
    );
  }, [address, ensAvatar]);

  const partialAddress = truncateAddress(address);

  const currentOrigin = window.location.origin;

  return (
    <div className="flex flex-row items-center justify-between">
      <AvatarWithTitle
        avatarSrc={addressLogo}
        title={ensName || partialAddress}
        avatarAlt="Address Logo"
        dataTestId={{ title: "contributor-address" }}
      />
      <div className="flex justify-between items-center">
        <CopyToClipboardButton
          textToCopy={`${currentOrigin}/#/contributors/${address}`}
          iconStyle="w-3.5 mr-1 mt-1 shadow-sm"
        />
      </div>
    </div>
  );
}
