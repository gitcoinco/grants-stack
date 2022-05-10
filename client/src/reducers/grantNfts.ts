import {
  GrantActions,
  GRANT_CREATED
} from '../actions/grantNfts'
import { grantsPath } from '../routes'

interface Grant {
  id: number,
  ipfsHash: string
}
export interface GrantState {
  grants: Grant[]
}

const initialState: GrantState = {
  grants: []
}

export const grantReducer = (state: GrantState = initialState, action: GrantActions): GrantState => {
  switch (action.type) {
    case GRANT_CREATED: {
      return {
        ...state,
        grants: [...state.grants, {
          ipfsHash: action.txHash,
          id: 1
        }]
      }
    }
    default: {
      return initialState
    }
  }
}