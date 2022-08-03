import "./browserPatches";
import ReactDOM from "react-dom/client";
import { Route, Routes } from "react-router";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import Datadog from "react-datadog";
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
import ProjectsList from "./components/grants/List";
import Project from "./components/grants/Show";
import NewProject from "./components/grants/New";
import EditProject from "./components/grants/Edit";
import RoundShow from "./components/rounds/Show";
import RoundApply from "./components/rounds/Apply";
import Landing from "./components/grants/Landing";
import { initializeWeb3 } from "./actions/web3";

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
if (process.env.NODE_ENV !== "production" || urlParams.get("debug") !== null) {
  middlewares = [...middlewares, logger];
}

const store = createStore(createRootReducer(), applyMiddleware(...middlewares));
store.dispatch<any>(initializeWeb3(false));

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const colors = {
  // example:
  // brand: {
  //   900: '#1a365d',
  //   800: '#153e75',
  //   700: '#2a69ac',
  // },
};

const theme = extendTheme({ colors });

root.render(
  // <React.StrictMode>
  <ErrorBoundary>
    <Datadog
      applicationId="5c45f4d1-3258-4206-bbdb-b73c9af5f340"
      clientToken="pubf505ad0eca99217895614fb3000dea1f"
      site="datadoghq.eu"
      service="grant-hub"
      // Specify a version number to identify the deployed version of your application in Datadog
      // version="1.0.0"
      sampleRate={100}
      premiumSampleRate={100}
      // trackInteractions
      sessionReplayRecording={false}
      // Uncomment if session replay is enabled
      // defaultPrivacyLevel="mask-user-input"
    >
      <ChakraProvider theme={theme} resetCSS={false}>
        <Provider store={store}>
          <ReduxRouter history={history} store={store}>
            <Layout>
              <Routes>
                <Route path={slugs.root} element={<Landing />} />
                <Route path={slugs.grants} element={<ProjectsList />} />
                <Route path={slugs.grant} element={<Project />} />
                <Route path={slugs.newGrant} element={<NewProject />} />
                <Route path={slugs.edit} element={<EditProject />} />
                <Route path={slugs.round} element={<RoundShow />} />
                <Route path={slugs.roundApplication} element={<RoundApply />} />
              </Routes>
            </Layout>
          </ReduxRouter>
        </Provider>
      </ChakraProvider>
    </Datadog>
  </ErrorBoundary>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
