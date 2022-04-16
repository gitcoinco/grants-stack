import Web3 from 'web3';

export interface Global {
  web3: Web3 | undefined
}

export const global: Global = {
  web3: undefined,
};
