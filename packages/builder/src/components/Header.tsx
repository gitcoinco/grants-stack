import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { getAlloVersion } from "common/src/config";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { NavbarGeneric } from "common/src/components";
import { grantsPath, newGrantPath } from "../routes";
import CustomerSupport from "./base/CustomerSupport";
import colors from "../styles/colors";
import Plus from "./icons/Plus";
import { ReactComponent as BuilderLogo } from "../assets/builder-logo.svg";
import { ReactComponent as BuilderLogoMobile } from "../assets/builder-logo-mobile.svg";

export default function Header({
  showNewProjectButton = true,
  showHelpButton = true,
  className,
}: {
  showNewProjectButton?: boolean;
  showHelpButton?: boolean;
  className?: string;
}) {
  const { switchToVersion } = useAlloVersion();
  const version = getAlloVersion();
  const showBanner =
    version === "allo-v1" &&
    (window.location.hash === "#/projects" ||
      window.location.hash === "#/projects/new");

  return (
    <div className=" flex flex-col mb-3">
      <NavbarGeneric showBanner={showBanner} className={className}>
        <NavbarGeneric.Logo to={grantsPath()}>
          <BuilderLogo className="h-8 w-auto hidden lg:block stroke" />
          <BuilderLogoMobile className="h-8 w-auto hidden sm:block lg:hidden" />
        </NavbarGeneric.Logo>
        <NavbarGeneric.Actions>
          {showNewProjectButton && (
            <Link
              to={newGrantPath()}
              data-track-event="project-create-topnav-next"
            >
              <Button colorScheme="purple" className="mt-2 mr-2 mb-2">
                <i className="icon">
                  <Plus color={colors["quaternary-text"]} />
                </i>
                <span className="hidden sm:block">New Project</span>
              </Button>
            </Link>
          )}
          <NavbarGeneric.ConnectButton>
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              label="Connect wallet"
              chainStatus={{ smallScreen: "icon" }}
            />
          </NavbarGeneric.ConnectButton>
          {showHelpButton && <CustomerSupport />}
        </NavbarGeneric.Actions>
        <NavbarGeneric.Banner>
          <div className="w-full bg-black flex justify-center">
            <div className="p-4 text-center font-medium text-white">
              <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
              You are currently on Allo v1. To switch to the most current
              version of Builder, &nbsp;
              <button
                type="button"
                className="underline"
                aria-label="Switch to Allo v2"
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
        </NavbarGeneric.Banner>
      </NavbarGeneric>
    </div>
  );
}
