// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from "util";
import { TextEncoder } from "util";
import { Chain } from "@rainbow-me/rainbowkit";

// @ts-expect-error I love jest
global.TextDecoder = TextDecoder;
// Fantom Testnet
const fantomTestnet: Chain = {
  id: 4002,
  name: "Fantom Testnet",
  network: "fantom testnet",
  iconUrl:
    "https://gitcoin.mypinata.cloud/ipfs/bafkreih3k2dxplvtgbdpj43j3cxjpvkkwuoxm2fbvthzlingucv6ncauaa",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM",
  },
  rpcUrls: {
    default: "https://rpc.testnet.fantom.network/",
  },
  blockExplorers: {
    default: { name: "ftmscan", url: "https://testnet.ftmscan.com" },
  },
  testnet: true,
};

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  configureChains: jest.fn().mockReturnValue({
    chains: [fantomTestnet],
  }),
  useSwitchNetwork: jest.fn(),
  useDisconnect: jest.fn(),
  useBalance: jest.fn(),
  useSigner: jest.fn(),
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
}));

jest.mock("@rainbow-me/rainbowkit", () => ({
  ...jest.requireActual("@rainbow-me/rainbowkit"),
  ConnectButton: jest.fn(),
}));

beforeEach(() => {
  // @headlessui/react needs IntersectionObserver but isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});
