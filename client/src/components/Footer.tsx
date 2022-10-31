import { Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Code from "./icons/Code";
import Discord from "./icons/Discord";
import Github from "./icons/Github";
import Support from "./icons/Support";

export default function Footer() {
  return (
    <div className="flex justify-end mr-12">
      <ul className="flex items-center">
        <Tooltip
          bg="purple.800"
          label="Contact Support"
          placement="top"
          hasArrow
        >
          <li className="p-4 cursor-pointer hover:text-gitcoin-violet-400">
            <Link to="https://support.gitcoin.co/">
              <Support color="none" />
            </Link>
          </li>
        </Tooltip>
        <Tooltip bg="purple.800" label="Discord" placement="top" hasArrow>
          <li className="p-4 cursor-pointer hover:text-gitcoin-violet-400">
            <a href="https://discord.gg/gitcoin">
              <Discord color="black" />
            </a>
          </li>
        </Tooltip>
        <Tooltip bg="purple.800" label="GitHub" placement="top" hasArrow>
          <li className="p-4 cursor-pointer hover:text-gitcoin-violet-400">
            <a href="https://github.com/gitcoinco">
              <Github color="black" />
            </a>
          </li>
        </Tooltip>
        <Tooltip
          bg="purple.800"
          label="Developer Docs"
          placement="top"
          hasArrow
        >
          <li className="p-4 cursor-pointer hover:text-gitcoin-violet-400">
            <a href="https://app.gitbook.com/o/Aqbtj6s4OkLaygileCka/home">
              <Code color="none" />
            </a>
          </li>
        </Tooltip>
      </ul>
    </div>
  );
}
