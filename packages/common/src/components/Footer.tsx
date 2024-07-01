import Discord from "../icons/Discord";
import Github from "../icons/Github";
import Gitbook from "../icons/Gitbook";
import ManagerIcon from "../icons/ManagerIcon";
import BuilderIcon from "../icons/BuilderIcon";

// Note: Footer Navigation items
const navigation = [
  // note: the Manager and Builder icons are white... so they are not visible on the white background of the footer
  {
    name: "Manager",
    href: "https://manager.gitcoin.co",
    testid: "support",
    icon: ManagerIcon,
  },
  {
    name: "Builder",
    href: "https://builder.gitcoin.co",
    testid: "support",
    icon: BuilderIcon,
  },
  {
    name: "Discord",
    href: "https://discord.gg/gitcoin",
    testid: "discord",
    icon: Discord,
  },
  {
    name: "GitHub",
    href: "https://github.com/gitcoinco/grants-stack",
    testid: "github",
    icon: Github,
  },
  {
    name: "Knowledge Base",
    href: "https://support.gitcoin.co/gitcoin-knowledge-base",
    testid: "knowledgebase",
    icon: Gitbook,
  },
];

const COMMIT_HASH = process.env.REACT_APP_GIT_SHA ?? "localhost";

export default function Footer() {
  return (
    <footer className="py-3 px-4 sm:px-6 lg:px-20">
      <div className="flex flex-row-reverse justify-between py-6 overflow-hidden">
        <div className="flex justify-around space-x-4 md:order-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-500 hover:text-gray-500"
              data-testid={item.testid}
            >
              <span className="sr-only hidden">{item.name}</span>
              <item.icon />
            </a>
          ))}
        </div>
      </div>
      <div className="hidden">{COMMIT_HASH}</div>
    </footer>
  );
}
