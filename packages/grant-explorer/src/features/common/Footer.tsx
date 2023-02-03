import { ReactComponent as GitcoinCommunityLogo } from "../../assets/gitcoincommunity-logo.svg";
import { ReactComponent as SupportIcon } from "../../assets/support.svg";
import { ReactComponent as GithubIcon } from "../../assets/github.svg";
import { ReactComponent as GitbookIcon } from "../../assets/gitbook.svg";
import ReactTooltip from "react-tooltip";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-7xl md:flex md:justify-between mx-auto py-12 overflow-hidden">
        <div></div>
        <div className="mt-8 md:mt-0 md:ml-36 flex justify-center mb-4">
          <GitcoinCommunityLogo className=""></GitcoinCommunityLogo>
        </div>
        <div className="flex justify-center space-x-8 md:order-1">
          <a href="https://support.gitcoin.co/gitcoin-knowledge-base/misc/contact-us">
            <SupportIcon
              data-tip
              data-background-color="#0E0333"
              data-for="support-tooltip"
            />
            <ReactTooltip
              id="support-tooltip"
              place="top"
              type="dark"
              effect="solid"
            >
              <p className="text-xs">Contact Support</p>
            </ReactTooltip>
          </a>
          <a href="https://github.com/gitcoinco/grants-round">
            <GithubIcon
              data-tip
              data-background-color="#0E0333"
              data-for="github-tooltip"
            />
            <ReactTooltip
              id="github-tooltip"
              place="top"
              type="dark"
              effect="solid"
            >
              <p className="text-xs">Github</p>
            </ReactTooltip>
          </a>
          <a href="https://gitcoin-2.gitbook.io/round/">
            <GitbookIcon
              data-tip
              data-background-color="#0E0333"
              data-for="gitbook-tooltip"
            />
            <ReactTooltip
              id="gitbook-tooltip"
              place="top"
              type="dark"
              effect="solid"
            >
              <p className="text-xs">Gitbook</p>
            </ReactTooltip>
          </a>
        </div>
      </div>
    </footer>
  );
}
