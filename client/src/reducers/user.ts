import { PROJECT_ID_SELECTED, UserActions } from "../actions/user";

export interface UserState {
  selectedProjectId: number | undefined;
}

const initialState = {
  selectedProjectId: undefined,
};

const userReducer = (
  state: UserState = initialState,
  action: UserActions
): UserState => {
  switch (action.type) {
    case PROJECT_ID_SELECTED: {
      return {
        ...state,
        selectedProjectId: action.id,
      };
    }
    default: {
      return state;
    }
  }
};

export default userReducer;
