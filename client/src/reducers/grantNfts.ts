import {
  GrantActions,
  GRANT_CREATED,
  GRANT_TX_STATUS
} from '../actions/grantNfts'

interface Grant {
  id: number,
  ipfsHash: string
}
export interface GrantState {
  grants: Grant[]
  txStatus: string | null
}

const initialState: GrantState = {
  grants: [],
  txStatus: null
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
    case GRANT_TX_STATUS: {
      return {
        ...state,
        txStatus: action.status
      }
    }
    default: {
      return initialState
    }
  }
}