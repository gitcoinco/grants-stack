import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PGN as PGNLogoIcon } from "common/src/icons/PGN";
import { PGNText as PGNTextLogoIcon } from "common/src/icons/PGNText";
import { grantsPath, newGrantPath } from "../routes";
import CustomerSupport from "./base/CustomerSupport";
import colors from "../styles/colors";
import Hamburger from "./icons/Hamburger";
import Plus from "./icons/Plus";
import { GitcoinLogo, BuilderLogo } from "../assets";

export default function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 sm:px-2 mb-3 text-primary-text w-full border-0 sm:border-b container mx-auto h-1/8">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <Link to={grantsPath()}>
            <div className="flex">
              <img className="py-4 mr-4" alt="Gitcoin Logo" src={GitcoinLogo} />
              <span className="border border-gitcoin-separator my-[1.35rem] mr-4" />
              <img className="py-4" alt="Builder Logo" src={BuilderLogo} />
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="lg:hidden"
          >
            <div className="border-solid border rounded border-primary-text p-2">
              <Hamburger color={colors["primary-text"]} />
            </div>
          </button>
        </div>
        <div
          className={`lg:flex flex-grow items-center${
            navbarOpen ? " flex" : " hidden"
          }`}
          id="example-navbar-danger"
        >
          <div className="flex flex-col lg:flex-row list-none lg:ml-auto">
            <Link to={newGrantPath()}>
              <Button colorScheme="purple" className="mt-2 mr-2 mb-2">
                <i className="icon">
                  <Plus color={colors["quaternary-text"]} />
                </i>
                New Project
              </Button>
            </Link>
            <ConnectButton />
            <a
              href="https://bridge.gitcoin.co"
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center mx-3"
            >
              <PGNLogoIcon className="mr-2" />
              <PGNTextLogoIcon fill="black" />
            </a>
            <CustomerSupport />
          </div>
        </div>
      </div>
    </header>
  );
}
