import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { getAlloVersion } from "common/src/config";
import {
  AlloVersionSwitcher,
  useAlloVersion,
} from "common/src/components/AlloVersionSwitcher";
import { grantsPath, newGrantPath } from "../routes";
import CustomerSupport from "./base/CustomerSupport";
import colors from "../styles/colors";
import Hamburger from "./icons/Hamburger";
import Plus from "./icons/Plus";
import { GitcoinLogo, BuilderLogo } from "../assets";

export default function Header({
  alloVersionSwitcherVisible = true,
}: {
  alloVersionSwitcherVisible?: boolean;
}) {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const { switchToVersion } = useAlloVersion();
  const version = getAlloVersion();

  return (
    <div className="mb-3">
      <header className="flex items-center justify-between px-4 sm:px-2 text-primary-text w-full border-0 sm:border-b container mx-auto h-1/8">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link to={grantsPath()}>
              <div className="flex">
                <img
                  className="py-4 mr-4"
                  alt="Gitcoin Logo"
                  src={GitcoinLogo}
                />
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
            <div className="flex flex-col lg:flex-row list-none lg:ml-auto items-center">
              <Link
                to={newGrantPath()}
                data-track-event="project-create-topnav-next"
              >
                <Button colorScheme="purple" className="mt-2 mr-2 mb-2">
                  <i className="icon">
                    <Plus color={colors["quaternary-text"]} />
                  </i>
                  New Project
                </Button>
              </Link>
              {alloVersionSwitcherVisible && (
                <AlloVersionSwitcher color="black" />
              )}
              <ConnectButton />
              <CustomerSupport />
            </div>
          </div>
        </div>
      </header>
      {version === "allo-v1" &&
        (window.location.hash === "#/projects" ||
          window.location.hash === "#/projects/new") && (
          <div className="bg-black p-4 text-center font-medium flex flex-col items-center justify-center text-white">
            <div>
              <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
              You are currently on Allo v1. To switch to the most current
              version of Builder,&nbsp;
              <button
                type="button"
                className="underline"
                onClick={(e) => {
                  e.preventDefault();
                  switchToVersion("allo-v2");
                }}
              >
                switch to Allo v2.
              </button>
              &nbsp;
            </div>
          </div>
        )}
    </div>
  );
}
