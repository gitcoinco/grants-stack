import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "common/src/components/Navbar";
import { GitcoinLogo, BuilderLogo } from "../assets";
import CustomerSupport from "./base/CustomerSupport";
import Plus from "./icons/Plus";
import { grantsPath, newGrantPath } from "../routes";
import colors from "../styles/colors";

export default function BuilderNavbar() {
  const classNames = [
    "flex items-center justify-between px-4 sm:px-2 text-primary-text w-full border-0 sm:border-b container mx-auto h-1/8",
    "container mx-auto flex flex-wrap items-center justify-between",
    "w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start",
  ];

  return (
    <Navbar
      classNames={classNames}
      ConnectWalletItem={<ConnectButton />}
      logo={
        <Link to={grantsPath()}>
          <div className="flex">
            <img className="py-4 mr-4" alt="Gitcoin Logo" src={GitcoinLogo} />
            <span className="border border-gitcoin-separator my-[1.35rem] mr-4" />
            <img className="py-4" alt="Builder Logo" src={BuilderLogo} />
          </div>
        </Link>
      }
      leftWalletElements={[
        <Link to={newGrantPath()} data-track-event="project-create-topnav-next">
          <Button colorScheme="purple" className="mt-2 mr-2 mb-2">
            <i className="icon">
              <Plus color={colors["quaternary-text"]} />
            </i>
            New Project
          </Button>
        </Link>,
      ]}
      extraRightElements={[<CustomerSupport />]}
    />
  );
}
