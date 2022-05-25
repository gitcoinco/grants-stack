import "./browserPatches";
import ReactDOM from "react-dom/client";
import { Route, Routes } from "react-router";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import {
  createStore,
  applyMiddleware,
  Middleware,
  MiddlewareAPI,
  Dispatch,
} from "redux";
import {
  createRouterMiddleware,
  ReduxRouter,
} from "@lagunovsky/redux-react-router";
import { createRootReducer } from "./reducers";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";
import Layout from "./components/Layout";
import reportWebVitals from "./reportWebVitals";
import history from "./history";
import { slugs } from "./routes";
import GrantsList from "./components/grants/List";
import Project from "./components/grants/Show";
import NewProject from "./components/grants/New";
import EditProject from "./components/grants/Edit";
import Landing from "./components/grants/Landing";
import ComponentLibrary from "./components/Library";
import { startIPFS } from "./actions/ipfs";

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

const store = createStore(createRootReducer(), applyMiddleware(...middlewares));
store.dispatch<any>(startIPFS());

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  // <React.StrictMode>
  <ErrorBoundary>
    <Provider store={store}>
      <ReduxRouter history={history} store={store}>
        <Layout>
          <Routes>
            <Route path={slugs.root} element={<Landing />} />
            <Route path={slugs.grants} element={<GrantsList />} />
            <Route path={slugs.grant} element={<Project />} />
            <Route path={slugs.newGrant} element={<NewProject />} />
            <Route path={slugs.edit} element={<EditProject />} />
            <Route path={slugs.components} element={<ComponentLibrary />} />
          </Routes>
        </Layout>
      </ReduxRouter>
    </Provider>
  </ErrorBoundary>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
