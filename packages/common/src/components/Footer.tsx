import Discord from "../icons/Discord";
import Support from "../icons/Support";
import Github from "../icons/Github";
import Gitbook from "../icons/Gitbook";
import { getConfig, setLocalStorageConfigOverride } from "../config";

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

const config = getConfig();
const COMMIT_HASH = process.env.REACT_APP_GIT_SHA ?? "localhost";
const ALLO_VERSION = config.allo.version;

function switchAlloVersion(version: string) {
  setLocalStorageConfigOverride("allo-version", version);
  window.location.reload();
}

export default function Footer() {
  const alloVersionAlternative =
    ALLO_VERSION === "allo-v1" ? "allo-v2" : "allo-v1";

  return (
    <footer
      className={
        "p-3 px-8 flex flex-row justify-between items-center relative z-10"
      }
    >
      <div className={"text-gray-500 text-xs"}>
        build {COMMIT_HASH}-{ALLO_VERSION}
        {config.appEnv === "development" && (
          <button
            className="ml-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => switchAlloVersion(alloVersionAlternative)}
          >
            Switch to {alloVersionAlternative}
          </button>
        )}
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
