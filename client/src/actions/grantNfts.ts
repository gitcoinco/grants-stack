import { ethers } from 'ethers'
import { global } from '../global';
import {
  Dispatch,
} from 'redux';
import { RootState } from '../reducers';
import { notWeb3Browser } from './web3'
import GrantNFTABI from '../contracts/abis/GrantNFT.json'
import { Rinkeby } from '../contracts/deployments' 

export type GrantActions = GrantCreated | GrantTXStatus

export const GRANT_TX_STATUS = "GRANT_TX_STATUS";
export interface GrantTXStatus {
  type: typeof GRANT_TX_STATUS
  status: string
}
export const grantTXStatus = (status: string): GrantActions => ({
  type: GRANT_TX_STATUS,
  status,
})


export const GRANT_CREATED = "GRANT_CREATED";
export interface GrantCreated {
  type: typeof GRANT_CREATED
  txHash: string
}
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
          dispatch(grantTXStatus('initiated'))
          const txStatus = await mintTx.wait()
          if (txStatus.status) {
            dispatch(grantTXStatus('complete'))
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
