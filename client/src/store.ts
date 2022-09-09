import {
  applyMiddleware,
  createStore,
  Dispatch,
  Middleware,
  MiddlewareAPI,
  PreloadedState,
} from "redux";
import { createRouterMiddleware } from "@lagunovsky/redux-react-router";
import thunkMiddleware from "redux-thunk";
import { RootState, createRootReducer } from "./reducers";
import history from "./history";

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

const urlParams = new URLSearchParams(window.location.search);
if (
  (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") ||
  urlParams.get("debug") !== null
) {
  middlewares = [...middlewares, logger];
}

const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  createStore(
    createRootReducer(),
    preloadedState,
    applyMiddleware(...middlewares)
  );

export default setupStore;
