import { Dropdown as DropdownIcon } from "common/src/icons/Dropdown";
import { PGN as PGNLogoIcon } from "common/src/icons/PGN";
import { PGNText as PGNTextLogoIcon } from "common/src/icons/PGNText";
import React, { useState } from "react";
import { ChainId } from "common/src/chains";
import { Round } from "allo-indexer-client";

export type SubNavRound = Pick<Round, "id"> & {
  chainId: ChainId;
  name: string;
};

type Props = {
  onClick: (round: SubNavRound) => void;
};

const rounds: SubNavRound[] = [
  {
    id: "0xd0a086c37fbd20c44f3ba2cff69208d1b62f54e3",
    name: "Gaming Round",
    chainId: ChainId.ARBITRUM,
  },
  {
    id: "0x8b70206844630d8c0a2a545e92d3c8d46a3ceaad",
    name: "New Protocol Ideas Round",
    chainId: ChainId.ARBITRUM,
  },
  {
    id: "0x1d16f0eedf8ced25f288056ddcbb653d0f0451ad",
    name: "Developer Tooling on Nova",
    chainId: ChainId.ARBITRUM,
  },
  {
    id: "0x59d79b22595b17af659ce9b03907615f53742c57",
    name: "Education, Community Growth & Events Round",
    chainId: ChainId.ARBITRUM,
  },
  {
    id: "0x8dce7a66e0c310f9f89e847dba83b2344d589161",
    name: "Vault Round 1",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
  },
];

export function RoundsSubNav(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-grey-150">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-12 flex-row-reverse">
          <div className="flex items-center gap-6">
            <div>
              <a
                href="https://bridge.gitcoin.co"
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 flex items-center"
              >
                <PGNLogoIcon className="mr-2" />
                <PGNTextLogoIcon fill="black" className="mt-1" />
              </a>
            </div>
            <div className="relative bg-white">
              <span
                style={{
                  border: "1px solid var(--sky-600, #15B8DC)",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  boxShadow:
                    "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)",
                }}
                className="cursor-pointer flex gap-2 items-center"
                aria-label={"Open Grants Subnav"}
                onClick={() => setOpen(!open)}
              >
                Active rounds
                <DropdownIcon
                  className="inline"
                  direction={open ? "up" : "down"}
                />
              </span>
              <div
                className={`absolute right-0 top-12 bg-grey-150 py-4 px-6 rounded-lg text-right whitespace-nowrap ${
                  open ? "block" : "hidden"
                }`}
              >
                <ul>
                  {rounds.map((round) => (
                    <li key={round.id}>
                      <a
                        data-testid={`round-link-${round.id}`}
                        href="#"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          props.onClick(round);
                        }}
                        className="flex justify-end py-2 items-center"
                      >
                        <img
                          src={(() => {
                            switch (round.chainId) {
                              case ChainId.ARBITRUM:
                                return "/logos/arb-logo.svg";
                              case ChainId.FANTOM_MAINNET_CHAIN_ID:
                                return "/logos/fantom-logo.svg";
                            }
                          })()}
                          alt="chain logo"
                          data-testid="chain-logo"
                          className="h-5 w-5 rounded-full mr-1 ml-4"
                        />
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
