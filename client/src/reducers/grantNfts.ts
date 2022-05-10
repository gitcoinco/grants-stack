import {
  GrantActions,
  GRANT_CREATED,
  GRANT_TX_STATUS
} from '../actions/grantNfts'

export interface Grant {
  id: number,
  ipfsHash: string,
  owner?: string
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
          id: action.id,
          ipfsHash: action.ipfsHash,
          owner: action.owner
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