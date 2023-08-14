import { GG18 as GG18Icon } from "../icons/GG18";
import { Dropdown as DropdownIcon } from "../icons/Dropdown";
import { PGN as PGNLogoIcon } from "../icons/PGN";
import { PGNText as PGNTextLogoIcon } from "../icons/PGNText";
import React, { useState } from "react";

type Round = {
  name: string;
  chainId: number;
  id: `0x${string}`;
};

const ROUNDS: Round[] = [
  {
    name: "Climate solutions",
    chainId: 10,
    id: "0xb6be0ecafdb66dd848b0480db40056ff94a9465d",
  },
  {
    name: "Ethereum Infrastructure",
    chainId: 424,
    id: "0x222ea76664ed77d18d4416d2b2e77937b76f0a35",
  },
  {
    name: "Web3 Community and Education",
    chainId: 10,
    id: "0x2871742b184633f8dc8546c6301cbc209945033e",
  },
  {
    name: "Web3 Open Source Software",
    chainId: 10,
    id: "0x8de918f0163b2021839a8d84954dd7e8e151326d",
  },
  {
    name: "Zuzalu",
    chainId: 10,
    id: "0x5b95acf46c73fd116f0fedadcbedf453530e35d0",
  },
  {
    name: "Token Engineering (TEC)",
    chainId: 10,
    id: "0xc5fdf5cff79e92fac1d6efa725c319248d279200",
  },
  {
    name: "Latin America",
    chainId: 10,
    id: "0xf591e42dfdfe8e62c2085ccaadfe05f84d89d0c6",
  },
  {
    name: "Web3 Social",
    chainId: 10,
    id: "0x9331fde4db7b9d9d1498c09d30149929f24cf9d5",
  },
  {
    name: "Global Chinese Community",
    chainId: 10,
    id: "0x30c381033aa2830ceb0aa372c2e4d28f004b3db9",
  },
  {
    name: "ReFiDAO",
    chainId: 10,
    id: "0x10be322de44389ded49c0b2b73d8c3a1e3b6d871",
  },
];

export function RoundsSubNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-grey-150">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16 flex-row-reverse">
          <div className="flex items-center gap-6">
            <div>
              <a
                href="https://bridge.gitcoin.co"
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 flex items-center"
              >
                <span className="mr-2">
                  <PGNLogoIcon />
                </span>
                <PGNTextLogoIcon fill="black" />
              </a>
            </div>
            <div className="relative">
              <span className="cursor-pointer" onClick={() => setOpen(!open)}>
                <GG18Icon className="inline mr-2" />

                <span>
                  <DropdownIcon
                    className="inline"
                    direction={open ? "up" : "down"}
                  />
                </span>
              </span>
              <div
                className={`absolute right-0 top-8 bg-grey-150 py-4 px-3 rounded-lg text-right whitespace-nowrap ${
                  open ? "block" : "hidden"
                }`}
              >
                <ul>
                  <li className="border-b border-solid border-grey-200 py-1 mb-2">
                    Core Round
                  </li>
                  {ROUNDS.map((round: Round) => (
                    <li>
                      <a
                        href={`/#/round/${round.chainId}/${round.id}`}
                        className="block py-2"
                      >
                        {round.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
