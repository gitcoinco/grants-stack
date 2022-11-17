import { Tooltip } from "@chakra-ui/react";
import Code from "./icons/Code";
import Discord from "./icons/Discord";
import Github from "./icons/Github";
import Support from "./icons/Support";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="flex flex-col items-center justify-between p-6 bg-white dark:bg-gray-900 sm:flex-row"
    >
      <div className="w-72" />
      <img alt="Built by the Gitcoin Community" src="./assets/footer-img.svg" />
      <div className="flex flex-col -mx-2 items-center md:float-right w-72">
        <ul className="inline-flex justify-end items-center">
          <Tooltip
            bg="purple.800"
            label="Contact Support"
            placement="top"
            hasArrow
          >
            <li className="p-3 cursor-pointer hover:text-gitcoin-violet-400">
              <a href="https://support.gitcoin.co/gitcoin-knowledge-base/misc/contact-us">
                <Support color="none" />
              </a>
            </li>
          </Tooltip>
          <Tooltip bg="purple.800" label="Discord" placement="top" hasArrow>
            <li className="p-3 cursor-pointer hover:text-gitcoin-violet-400">
              <a href="https://discord.gg/gitcoin">
                <Discord color="black" />
              </a>
            </li>
          </Tooltip>
          <Tooltip bg="purple.800" label="GitHub" placement="top" hasArrow>
            <li className="p-3 cursor-pointer hover:text-gitcoin-violet-400">
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
            <li className="p-3 cursor-pointer hover:text-gitcoin-violet-400">
              <a href="https://app.gitbook.com/o/Aqbtj6s4OkLaygileCka/home">
                <Code color="none" />
              </a>
            </li>
          </Tooltip>
        </ul>
      </div>
    </footer>
  );
}
