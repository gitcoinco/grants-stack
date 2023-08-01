import { datadogLogs } from "@datadog/browser-logs";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Button, Input } from "common/src/styles";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { modalDelayMs } from "../../../constants";
import { useQFDonation } from "../../../context/QFDonationContext";
import { useRoundById } from "../../../context/RoundContext";
import {
  fetchPassport,
  PassportResponse,
  PassportState,
} from "../../api/passport";
import { ChainId, useTokenPrice } from "common";
import { CartProject, PayoutToken, ProgressStatus } from "../../api/types";
import {
  CHAINS,
  GroupedCartProjectsByRoundId,
  getPayoutTokenOptions,
  groupProjectsInCart,
} from "../../api/utils";
import ConfirmationModal from "../../common/ConfirmationModal";
import ErrorModal from "../../common/ErrorModal";
import Footer from "common/src/components/Footer";
import InfoModal from "../../common/InfoModal";
import Navbar from "../../common/Navbar";
import ProgressModal from "../../common/ProgressModal";
import { Logger } from "ethers/lib.esm/utils";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";
import { ConfirmationModalBody } from "./ConfirmationModalBody";
import { EmptyCart } from "./EmptyCart";
import { Header } from "./Header";
import { ApplyTooltip } from "./ApplyTooltip";
import { RoundInCart } from "./RoundInCart";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";
import { Summary } from "./Summary";
import { InfoModalBody } from "./InfoModalBody";
import { useCartStorage } from "../../../store";
import { CartWithProjects } from "./CartWithProjects";

export default function ViewCart() {
  const { projects } = useCartStorage();
  const groupedCartProjects = groupProjectsInCart(projects);

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Cart",
      path: `/cart`,
    },
  ] as BreadcrumbItem[];

  return (
    <>
      <Navbar roundUrlPath={"/"} />
      <div className="relative top-16 lg:mx-20 h-screen px-4 py-7">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <Header />
          <div className="flex flex-col md:flex-row gap-5">
            {projects.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="flex flex-col gap-5">
                {Object.keys(groupedCartProjects).map((chainId) => (
                  <div key={Number(chainId)}>
                    <CartWithProjects
                      cart={groupedCartProjects[Number(chainId)]}
                      chainId={Number(chainId) as ChainId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}
