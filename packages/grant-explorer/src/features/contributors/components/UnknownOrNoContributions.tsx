import { useAccount } from "wagmi";

import DonationHistoryBanner from "../../../assets/DonationHistoryBanner";
import { truncateAddress } from "../utils/address";

export function UnknownOrNoContributions({
  address,
  ensName,
}: {
  address: string;
  ensName?: string | null;
}) {
  const { address: walletAddress } = useAccount();

  const partialAddress = truncateAddress(address);

  return (
    <>
      <div className="flex justify-center">
        <div className="w-3/4 my-6 text-center mx-auto">
          {address === walletAddress ? (
            <>
              <p className="text-md">
                This is your donation history page, where you can keep track of
                all the public goods you've funded.
              </p>
              <p className="text-md">
                As you make donations, your transaction history will appear
                here.
              </p>
            </>
          ) : (
            <>
              <p className="text-md">
                {`This is ${
                  ensName || partialAddress
                }’s donation history page, showcasing their contributions
              towards public goods.`}
              </p>
              <p className="text-md">
                As they make donations, their transaction history will appear
                here.
              </p>
            </>
          )}
          <div />
        </div>
      </div>
      <div className="flex justify-center">
        <DonationHistoryBanner className="w-full h-auto object-cover rounded-t" />
      </div>
    </>
  );
}
