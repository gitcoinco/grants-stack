import { ethers } from 'ethers'
import { global } from '../global';
import {
  Dispatch,
} from 'redux';
import { RootState } from '../reducers';
import { notWeb3Browser } from './web3'
import GrantNFTABI from '../contracts/abis/GrantNFT.json'
import { Rinkeby } from '../contracts/deployments' 

export const GRANT_CREATED = "GRANT_CREATED";
export interface GrantCreated {
  type: typeof GRANT_CREATED
  txHash: string
}

export type GrantActions = GrantCreated

export const grantCreated = (txHash: string): GrantActions => ({
  type: GRANT_CREATED,
  txHash
});

export const mintGrant = () => {
  if (window.ethereum && global.web3Provider) {
    return async (dispatch: Dispatch, getState: () => RootState) => {
      const state = getState();
      const signer = global.web3Provider?.getSigner()
      const grantNFTContract = new ethers.Contract(Rinkeby.grantNft, GrantNFTABI.abi, signer)
      const mintTx = await grantNFTContract.mintGrant(state.web3.account, state.ipfs.lastFileSavedURL)

      if (mintTx.hash) {
        dispatch(grantCreated(mintTx.hash))
      }
    }
  } else {
    return notWeb3Browser();
  }
}
