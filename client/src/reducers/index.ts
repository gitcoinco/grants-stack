import { combineReducers } from 'redux';
import {
  Web3State,
  web3Reducer,
} from './web3';
import {
  IPFSState,
  ipfsReducer,
} from './ipfs';

export interface RootState {
  web3: Web3State,
  ipfs: IPFSState,
}

export const createRootReducer = () => combineReducers({
  web3: web3Reducer,
  ipfs: ipfsReducer,
});
