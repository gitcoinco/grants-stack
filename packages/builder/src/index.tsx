import "./browserPatches";

import { ChakraProvider } from "@chakra-ui/react";
import { datadogRum } from "@datadog/browser-rum";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { getConfig } from "common/src/config";
import { DataLayer, DataLayerProvider } from "data-layer";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Navigate, Route, Routes } from "react-router";
import { WagmiConfig } from "wagmi";
import AlloWrapper from "./utils/AlloWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import PageNotFound from "./components/base/PageNotFound";
import EditProject from "./components/grants/Edit";
import ProjectsList from "./components/grants/List";
import NewProject from "./components/grants/New";
import Project from "./components/grants/Show";
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
import initTagmanager from "./tagmanager";

const dataLayerConfig = new DataLayer({
  search: {
    baseUrl: getConfig().dataLayer.searchServiceBaseUrl,
    pagination: {
      pageSize: 50,
    },
  },
  subgraph: {
    endpointsByChainId: getConfig().dataLayer.subgraphEndpoints,
  },
  indexer: {
    baseUrl: `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`,
  },
});

const store = setupStore();
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const gtcLightTheme = lightTheme();
gtcLightTheme.shadows.connectButton = "0 0 0 0px";

// Initialize datadog
initDatadog();

// Initialize tagmanager
initTagmanager();

datadogRum.addAction("Init");

const queryString = new URLSearchParams(window?.location?.search);

// Twitter oauth will attach code & state in oauth procedure
const queryError = queryString.get("error");
const queryCode = queryString.get("code");
const queryState = queryString.get("state");

// if Twitter oauth then submit message to other windows and close self
if ((queryError || queryCode) && queryState && /^twitter-.*/.test(queryState)) {
  // shared message channel between windows (on the same domain)
  const channel = new BroadcastChannel("twitter_oauth_channel");
  // only continue with the process if a code is returned
  if (queryCode) {
    channel.postMessage({
      target: "twitter",
      data: { error: queryError, code: queryCode, state: queryState },
    });
  }
  // always close the redirected window
  window.close();
}

// if Github oauth then submit message to other windows and close self
if ((queryError || queryCode) && queryState && /^github-.*/.test(queryState)) {
  // shared message channel between windows (on the same domain)
  const channel = new BroadcastChannel("github_oauth_channel");
  // only continue with the process if a code is returned
  if (queryCode) {
    channel.postMessage({
      target: "github",
      data: { error: queryError, code: queryCode, state: queryState },
    });
  }

  // always close the redirected window
  window.close();
}
/* this makes env var validation miss this var and therefore make it optional */
// eslint-disable-next-line @typescript-eslint/dot-notation
const pathname = process.env["REACT_APP_PATHNAME"];
if (pathname && pathname !== window.location.pathname) {
  window.location.pathname = pathname;
}

root.render(
  <ErrorBoundary>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={gtcLightTheme} coolMode>
        <ChakraProvider resetCSS={false}>
          <Provider store={store}>
            <AlloWrapper>
              <DataLayerProvider client={dataLayerConfig}>
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
              </DataLayerProvider>
            </AlloWrapper>
          </Provider>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </ErrorBoundary>
);

reportWebVitals();
