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
  try {
    if (window.ethereum && global.web3Provider) {
      return async (dispatch: Dispatch, getState: () => RootState) => {
        const state = getState();
        const signer = global.web3Provider?.getSigner()
        const grantNFTContract = new ethers.Contract(Rinkeby.grantNft, GrantNFTABI.abi, signer)
        if (state.ipfs.lastFileSavedURL) {
          const mintTx = await grantNFTContract.mintGrant(state.web3.account, state.ipfs.lastFileSavedURL)

          if (mintTx.hash) {
            dispatch(grantCreated(state.ipfs.lastFileSavedURL))
          } else {
            throw Error('Unable to mint TX')
          }
        }
      }
    }
  } catch (e) {
    return notWeb3Browser();
  }
}
