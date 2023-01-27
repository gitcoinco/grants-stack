import {
  applyMiddleware,
  createStore,
  Middleware,
  PreloadedState,
} from "redux";
import { createRouterMiddleware } from "@lagunovsky/redux-react-router";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";
import { RootState, createRootReducer } from "./reducers";
import history from "./history";

const routerMiddleware = createRouterMiddleware(history);
const composeEnhancers = composeWithDevTools({});

const middlewares: Middleware[] = [thunkMiddleware, routerMiddleware];

const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  createStore(
    createRootReducer(),
    preloadedState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

export default setupStore;
