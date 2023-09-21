import Discord from "../icons/Discord";
import Support from "../icons/Support";
import Github from "../icons/Github";
import Gitbook from "../icons/Gitbook";

const navigation = [
  {
    name: "Support",
    href: "https://support.gitcoin.co/gitcoin-knowledge-base",
    testid: "support",
    icon: Support,
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
    name: "GitBook",
    href: "https://docs.allo.gitcoin.co/getting-started/introduction",
    testid: "gitbook",
    icon: Gitbook,
  },
];

const COMMIT_HASH = process.env.REACT_APP_GIT_SHA ?? "localhost";

export default function Footer() {
  return (
    <footer className={"p-3 px-8 flex flex-row justify-between items-center"}>
      <div className={"text-gray-500 text-xs"}>
        build <pre className={"inline"}>{COMMIT_HASH}</pre>
      </div>
      <div className="flex flex-row-reverse justify-between py-12 overflow-hidden">
        <div className="flex justify-around space-x-4 md:order-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
              data-testid={item.testid}
            >
              <span className="sr-only hidden">{item.name}</span>
              <item.icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
