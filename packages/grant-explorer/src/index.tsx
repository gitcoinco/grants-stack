import "./browserPatches";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { RoundProvider } from "./context/RoundContext";
import { initDatadog } from "./datadog";
import { initSentry } from "./sentry";
import { initTagmanager } from "./tagmanager";
import { initPosthog } from "./posthog";
import { chains, config } from "./app/wagmi";
import reportWebVitals from "./reportWebVitals";
import { DataLayerProvider, DataLayer } from "data-layer";
import { getConfig } from "common/src/config";

import "./index.css";

// Routes
import AccessDenied from "./features/common/AccessDenied";
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import LandingPage from "./features/discovery/LandingPage";
import ThankYou from "./features/round/ThankYou";
import ViewProjectDetails from "./features/round/ViewProjectDetails";
import ViewRound from "./features/round/ViewRoundPage";
import { ViewContributionHistoryPage } from "./features/contributors/ViewContributionHistory";
import ViewCart from "./features/round/ViewCartPage/ViewCartPage";
import { ChakraProvider } from "@chakra-ui/react";
import ExploreRoundsPage from "./features/discovery/ExploreRoundsPage";

initSentry();
initDatadog();
initTagmanager();
initPosthog();

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
  subgraph: {
    endpointsByChainId: getConfig().dataLayer.subgraphEndpoints,
  },
});

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <WagmiConfig config={config}>
        <RainbowKitProvider coolMode chains={chains}>
          <RoundProvider>
            <DataLayerProvider client={dataLayer}>
              <HashRouter>
                <Routes>
                  {/* Protected Routes */}
                  <Route element={<Auth />} />

                  {/* Default Route */}
                  <Route path="/" element={<LandingPage />} />

                  <Route path="/rounds" element={<ExploreRoundsPage />} />

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

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </DataLayerProvider>
          </RoundProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
