import "./browserPatches";

import { RainbowKitProvider, Theme, lightTheme } from "@rainbow-me/rainbowkit";
import { ExploreProjectsPage } from "./features/discovery/ExploreProjectsPage";
import { getConfig } from "common/src/config";
import { DataLayer, DataLayerProvider } from "data-layer";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { chains, config } from "./app/wagmi";
import { RoundProvider } from "./context/RoundContext";
import { initDatadog } from "./datadog";
import { initPosthog } from "./posthog";
import reportWebVitals from "./reportWebVitals";
import { initSentry } from "./sentry";
import { initTagmanager } from "./tagmanager";

import "./index.css";

// Routes
import { ChakraProvider } from "@chakra-ui/react";
import AccessDenied from "./features/common/AccessDenied";
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import { ViewContributionHistoryPage } from "./features/contributors/ViewContributionHistory";
import ExploreRoundsPage from "./features/discovery/ExploreRoundsPage";
import LandingPage from "./features/discovery/LandingPage";
import ThankYou from "./features/round/ThankYou";
import ViewCart from "./features/round/ViewCartPage/ViewCartPage";
import ViewProjectDetails from "./features/round/ViewProjectDetails";
import ViewRound from "./features/round/ViewRoundPage";
import AlloWrapper from "./features/api/AlloWrapper";
import { merge } from "lodash";
import { PostHogProvider } from "posthog-js/react";

initSentry();
initDatadog();
initTagmanager();
const posthog = initPosthog();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const GRANTS_STACK_DATA_APPLICATIONS_PAGE_SIZE = 50;

const dataLayer = new DataLayer({
  search: {
    baseUrl: getConfig().dataLayer.searchServiceBaseUrl,
    pagination: {
      pageSize: GRANTS_STACK_DATA_APPLICATIONS_PAGE_SIZE,
    },
  },
  ipfs: {
    gateway: getConfig().ipfs.baseUrl,
  },
  subgraph: {
    endpointsByChainId: getConfig().dataLayer.subgraphEndpoints,
  },
  indexer: {
    baseUrl: `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`,
  },
});

const customRainbowKitTheme = merge(lightTheme(), {
  colors: {
    accentColor: "#FFD9CD",
    accentColorForeground: "#000000",
  },
}) as Theme;

root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <ChakraProvider>
        <WagmiConfig config={config}>
          <RainbowKitProvider
            theme={customRainbowKitTheme}
            coolMode
            chains={chains}
          >
            <RoundProvider>
              <DataLayerProvider client={dataLayer}>
                <AlloWrapper>
                  <HashRouter>
                    <Routes>
                      {/* Protected Routes */}
                      <Route element={<Auth />} />

                      {/* Default Route */}
                      <Route path="/" element={<LandingPage />} />

                      <Route path="/rounds" element={<ExploreRoundsPage />} />
                      <Route
                        path="/projects"
                        element={<ExploreProjectsPage />}
                      />

                      {/* Round Routes */}
                      <Route
                        path="/round/:chainId/:roundId"
                        element={<ViewRound />}
                      />
                      <Route
                        path="/round/:chainId/:roundId/:applicationId"
                        element={<ViewProjectDetails />}
                      />

                      <Route path="/cart" element={<ViewCart />} />

                      <Route path="/thankyou" element={<ThankYou />} />

                      <Route
                        path="/contributors/:address"
                        element={<ViewContributionHistoryPage />}
                      />

                      {/* Access Denied */}
                      <Route path="/access-denied" element={<AccessDenied />} />
                      <Route
                        path="/collections/:collectionCid"
                        element={<ExploreProjectsPage />}
                      />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </HashRouter>
                </AlloWrapper>
              </DataLayerProvider>
            </RoundProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </PostHogProvider>
  </React.StrictMode>
);

reportWebVitals();
