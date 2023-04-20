/*TODO(refactor): why is this file needed? What is it's function beside routing? Can React Router already do this natively?
 *  If needed - duplicates across RM and GE - dedupe*/
import { combineReducers, Middleware } from "redux";

import {
  createRouterMiddleware,
  createRouterReducer,
} from "@lagunovsky/redux-react-router";

import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";

import history from "../history";
import { api } from "../features/api";

const middlewares: Middleware[] = [
  thunkMiddleware,
  createRouterMiddleware(history),
  api.middleware,
];

export const store = configureStore({
  reducer: combineReducers({
    router: createRouterReducer(history),
    [api.reducerPath]: api.reducer,
  }),
  middleware: middlewares,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
