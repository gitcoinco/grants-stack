import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "common/src/components/Navbar";
import { GitcoinLogo, BuilderLogo } from "../assets";
import CustomerSupport from "./base/CustomerSupport";
import Plus from "./icons/Plus";
import { newGrantPath } from "../routes";

export default function BuilderNavbar() {
  return (
    <Navbar
      ConnectWalletItem={<ConnectButton />}
      logo={
        <div className="flex items-center">
          <img src={GitcoinLogo} alt="Gitcoin Logo" className="py-4" />
          <span className="border border-gray-400 mx-4" />
          <img src={BuilderLogo} alt="Builder Logo" className="py-4" />
        </div>
      }
      extraRightElements={[
        <Button as={Link} to={newGrantPath()}>
          <Plus color="" />
          New Project
        </Button>,
        <CustomerSupport />,
      ]}
    />
  );
}
