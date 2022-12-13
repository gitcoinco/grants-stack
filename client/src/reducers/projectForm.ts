import {
  METADATA_SAVED,
  METADATA_IMAGE_SAVED,
  CREDENTIALS_SAVED,
  FORM_RESET,
  ProjectFormActions,
} from "../actions/projectForm";
import { FormInputs, ProjectCredentials } from "../types";

export interface ProjectFormState {
  metadata: FormInputs;
  credentials?: ProjectCredentials;
}

export const initialState: ProjectFormState = {
  metadata: {},
  credentials: {},
};

export const projectFormReducer = (
  state: ProjectFormState = initialState,
  action: ProjectFormActions
) => {
  switch (action.type) {
    case METADATA_SAVED: {
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.metadata,
        },
      };
    }

    case METADATA_IMAGE_SAVED: {
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.fieldName]: action.image,
        },
      };
    }

    case CREDENTIALS_SAVED: {
      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...action.credentials,
        },
      };
    }

    case FORM_RESET: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
