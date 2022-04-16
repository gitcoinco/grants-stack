import { combineReducers } from 'redux';
import {
  Web3State,
  web3Reducer,
} from './web3';

export interface RootState {
  web3: Web3State
}

export const createRootReducer = () => combineReducers({
  web3: web3Reducer
});
