import { useEnsAddress } from "wagmi";
import { useParams } from "react-router-dom";
import { isAddress } from "viem";

import { getChains } from "common";
import Footer from "common/src/components/Footer";

import { ContributionHistoryContainer } from "./components/ContributionHistoryContainer";
import Navbar from "../common/Navbar";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";

// TODO: what to display if the address is not correct? '/contributors/123'
export function ViewContributionHistoryPage() {
  const { address: paramsAddress = "" } = useParams();
  const chainIds = getChains().map((chain) => chain.id);

  const { data: ensResolvedAddress } = useEnsAddress({
    name: isAddress(paramsAddress) ? undefined : paramsAddress,
    chainId: 1,
  });

  const address = ensResolvedAddress ?? paramsAddress;

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Donation history",
      path: `/contributors/${address}`,
    },
  ] as BreadcrumbItem[];

  if (!paramsAddress) {
    return null;
  }

  return (
    <div className="h-screen">
      <Navbar showWalletInteraction={true} />
      <div className="relative top-16 lg:mx-20 xl:mx-20 px-4 py-7 h-screen">
        <div className="flex pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <ContributionHistoryContainer address={address} chainIds={chainIds} />
        <div className="mt-24 mb-11 h-11">
          <Footer />
        </div>
      </div>
    </div>
  );
}
