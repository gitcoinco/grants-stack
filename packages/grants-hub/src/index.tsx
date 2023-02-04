import { ChakraProvider } from "@chakra-ui/react";
import { datadogRum } from "@datadog/browser-rum";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Navigate, Route, Routes } from "react-router";
import { WagmiConfig } from "wagmi";
import "./browserPatches";
import PageNotFound from "./components/base/PageNotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import EditProject from "./components/grants/Edit";
import ProjectsList from "./components/grants/List";
import NewProject from "./components/grants/New";
import Project from "./components/grants/Show";
import Layout from "./components/Layout";
import RoundApply from "./components/rounds/Apply";
import RoundShow from "./components/rounds/Show";
import ViewApplication from "./components/rounds/ViewApplication";
import history from "./history";
import reportWebVitals from "./reportWebVitals";
import { slugs } from "./routes";
import setupStore from "./store";
import "./styles/index.css";
import initDatadog from "./utils/datadog";
import wagmiClient, { chains } from "./utils/wagmi";

const store = setupStore();
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const gtcLightTheme = lightTheme();
gtcLightTheme.shadows.connectButton = "0 0 0 0px";

initDatadog();

datadogRum.addAction("Init");

const pathname = process.env.REACT_APP_PATHNAME;
if (pathname && pathname !== window.location.pathname) {
  window.location.pathname = pathname;
}

root.render(
  <ErrorBoundary>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={gtcLightTheme} coolMode>
        <ChakraProvider resetCSS={false}>
          <Provider store={store}>
            <ReduxRouter history={history} store={store}>
              <Layout>
                <Routes>
                  <Route
                    path={slugs.root}
                    element={<Navigate to={slugs.grants} />}
                  />
                  <Route path={slugs.grants} element={<ProjectsList />} />
                  <Route path={slugs.project} element={<Project />} />
                  <Route path={slugs.newGrant} element={<NewProject />} />
                  <Route path={slugs.edit} element={<EditProject />} />
                  <Route path={slugs.round} element={<RoundShow />} />
                  <Route
                    path={slugs.roundApplication}
                    element={<RoundApply />}
                  />
                  <Route
                    path={slugs.roundApplicationView}
                    element={<ViewApplication />}
                  />
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Layout>
            </ReduxRouter>
          </Provider>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
