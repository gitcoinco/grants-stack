import { Link } from "react-router-dom";

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as Search } from "../../assets/search-black.svg";
import { ReactComponent as ShortlistIcon } from "../../assets/shortlist-inactive.svg";

export interface NavbarProps {
  roundUrlPath: string;
}

export default function Navbar(props: NavbarProps) {
  return (
    <nav className="bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-20">
            <div className="flex justify-between h-16">
                <div className="flex">
                    <Link to="#" className="flex-shrink-0 flex items-center">
                        <GitcoinLogo className="block h-8 w-auto"/>
                        <div className="hidden lg:block md:block">
                            <span className="mx-6 text-grey-400">|</span>
                            <GrantsExplorerLogo className="lg:inline-block md:inline-block"/>
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <Search/>
                    <Shortlist count={0} roundUrlPath={props.roundUrlPath}/>
                    <ConnectButton/>
                </div>
            </div>
        </div>
    </nav>
  );
}

function Shortlist(props: { count: number, roundUrlPath: string }) {
    return (
        <span className="relative inline-block">
            <Link to={`${props.roundUrlPath}/ballot`}>
                <ShortlistIcon />
                <div className="inline-flex absolute top-2 left-1 justify-center items-center w-4 h-3 text-xs font-bold text-black">
                    {props.count === 0 ? "" : props.count}
                </div>
            </Link>
        </span>
    );
}
