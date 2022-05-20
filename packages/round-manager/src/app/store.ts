import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import thunkMiddleware from "redux-thunk";
import { createRootReducer } from '../reducers';
import {
  Middleware,
  MiddlewareAPI,
  Dispatch,
} from "redux";

import {
  createRouterMiddleware,
} from "@lagunovsky/redux-react-router";

import history from "../history";


const logger: Middleware =
  ({ getState }: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action) => {
    console.log("dispatch", action);
    const returnValue = next(action);
    console.log("state", getState());
    return returnValue;
  };

const routerMiddleware = createRouterMiddleware(history);

let middlewares: Middleware[] = [thunkMiddleware, routerMiddleware];

if (process.env.NODE_ENV !== "production") {
  middlewares = [...middlewares, logger];
}


export const store = configureStore({
  reducer: createRootReducer(),
  middleware: middlewares
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;