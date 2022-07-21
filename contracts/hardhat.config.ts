import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "@primitivefi/hardhat-dodoc";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: "0.8.4",

  networks: {
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    optimism: {
      url: process.env.OPTIMISM_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    optimisticKovan: {
      url: process.env.OPTIMISTIC_KOVAN_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
      optimisticKovan: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
    },
  },
};

export default config;
