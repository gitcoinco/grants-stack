import "./browserPatches";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { initDatadog } from "./datadog";
import { initTagmanager } from "./tagmanager";

import { chains, client as WagmiClient } from "./app/wagmi";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

// Routes
import { BulkUpdateGrantApplicationProvider } from "./context/application/BulkUpdateGrantApplicationContext";
import { ReadProgramProvider } from "./context/program/ReadProgramContext";
import { FinalizeRoundProvider } from "./context/round/FinalizeRoundContext";
import { FundContractProvider } from "./context/round/FundContractContext";
import { ReclaimFundsProvider } from "./context/round/ReclaimFundsContext";
import { RoundProvider } from "./context/round/RoundContext";
import AccessDenied from "./features/common/AccessDenied";
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import CreateProgram from "./features/program/CreateProgramPage";
import Program from "./features/program/ListProgramPage";
import ViewProgram from "./features/program/ViewProgramPage";
import CreateRound from "./features/round/CreateRoundPage";
import ViewApplication from "./features/round/ViewApplicationPage";
import ViewRoundPage from "./features/round/ViewRoundPage";
import { initSentry } from "./sentry";
import { UpdateRoundProvider } from "./context/round/UpdateRoundContext";
import AlloWrapper from "./features/api/AlloWrapper";
import { DataLayer, DataLayerProvider } from "data-layer";
import { getConfig } from "common/src/config";

// Initialize sentry
initSentry();

// Initialize datadog
initDatadog();

// Initialize tagmanager
initTagmanager();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

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

root.render(
  <React.StrictMode>
    <WagmiConfig client={WagmiClient}>
      <RainbowKitProvider coolMode chains={chains}>
        <AlloWrapper>
          <DataLayerProvider client={dataLayerConfig}>
            <HashRouter>
              <Routes>
                {/* Protected Routes */}
                <Route element={<Auth />}>
                  {/* Default Route */}
                  <Route
                    path="/"
                    element={
                      <ReadProgramProvider>
                        <Program />
                      </ReadProgramProvider>
                    }
                  />

                  {/* Round Routes */}
                  <Route
                    path="/round/create"
                    element={
                      <ReadProgramProvider>
                        <CreateRound />
                      </ReadProgramProvider>
                    }
                  />
                  <Route
                    path="/round/:id"
                    element={
                      <RoundProvider>
                        <BulkUpdateGrantApplicationProvider>
                          <FinalizeRoundProvider>
                            <FundContractProvider>
                              <ReclaimFundsProvider>
                                <UpdateRoundProvider>
                                  <ViewRoundPage />
                                </UpdateRoundProvider>
                              </ReclaimFundsProvider>
                            </FundContractProvider>
                          </FinalizeRoundProvider>
                        </BulkUpdateGrantApplicationProvider>
                      </RoundProvider>
                    }
                  />
                  <Route
                    path="/round/:roundId/application/:id"
                    element={
                      <RoundProvider>
                        <BulkUpdateGrantApplicationProvider>
                          <ViewApplication />
                        </BulkUpdateGrantApplicationProvider>
                      </RoundProvider>
                    }
                  />

                  {/* Program Routes */}
                  <Route path="/program/create" element={<CreateProgram />} />
                  <Route
                    path="/program/:id"
                    element={
                      <RoundProvider>
                        <ReadProgramProvider>
                          <ViewProgram />
                        </ReadProgramProvider>
                      </RoundProvider>
                    }
                  />

                  {/* Access Denied */}
                  <Route path="/access-denied" element={<AccessDenied />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </HashRouter>
          </DataLayerProvider>
        </AlloWrapper>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
