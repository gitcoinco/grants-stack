import "./browserPatches";

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { initDatadog } from "./datadog";
import { initTagmanager } from "./tagmanager";
import reportWebVitals from "./reportWebVitals";
import { WagmiProvider } from "wagmi";
import queryClient, { config } from "./app/wagmi";

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
import LandingPage from "./features/common/LandingPage";
import ViewProgram from "./features/program/ViewProgramPage";
import CreateRound from "./features/round/CreateRoundPage";
import ViewApplication from "./features/round/ViewApplicationPage";
import ViewRoundPage from "./features/round/ViewRoundPage";
import { initSentry } from "./sentry";
import { PostHogProvider } from "posthog-js/react";
import { UpdateRoundProvider } from "./context/round/UpdateRoundContext";
import { UpdateRolesProvider } from "./context/round/UpdateRolesContext";
import { UpdateRolesProvider as UpdateRolesProviderProgram } from "./context/program/UpdateRolesContext";
import AlloWrapper from "./features/api/AlloWrapper";
import { DataLayer, DataLayerProvider } from "data-layer";
import { getConfig } from "common/src/config";
import { initPosthog } from "./posthog";

// Initialize sentry
initSentry();

// Initialize datadog
initDatadog();

// Initialize tagmanager
initTagmanager();

// Initialize PostHog
const posthog = initPosthog();

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
  indexer: {
    baseUrl: `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`,
  },
});

const viewRoundPage = (
  <RoundProvider>
    <BulkUpdateGrantApplicationProvider>
      <FinalizeRoundProvider>
        <FundContractProvider>
          <ReclaimFundsProvider>
            <UpdateRoundProvider>
              <UpdateRolesProvider>
                <UpdateRolesProviderProgram>
                  <ViewRoundPage />
                </UpdateRolesProviderProgram>
              </UpdateRolesProvider>
            </UpdateRoundProvider>
          </ReclaimFundsProvider>
        </FundContractProvider>
      </FinalizeRoundProvider>
    </BulkUpdateGrantApplicationProvider>
  </RoundProvider>
);

const viewApplication = (
  <RoundProvider>
    <BulkUpdateGrantApplicationProvider>
      <ViewApplication />
    </BulkUpdateGrantApplicationProvider>
  </RoundProvider>
);

const viewProgram = (
  <ReadProgramProvider>
    <RoundProvider>
      <ViewProgram />
    </RoundProvider>
  </ReadProgramProvider>
);

const landing = (
  <ReadProgramProvider>
    <RoundProvider>
      <LandingPage />
    </RoundProvider>
  </ReadProgramProvider>
);

root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={{
              ...lightTheme(),
              colors: {
                ...lightTheme().colors,
                accentColor: "#FFEFBE",
                accentColorForeground: "#000000",
              },
            }}
          >
            <AlloWrapper>
              <DataLayerProvider client={dataLayerConfig}>
                <HashRouter>
                  <Routes>
                    {/* Protected Routes */}
                    <Route element={<Auth />}>
                      {/* Default Route */}
                      <Route path="/" element={landing} />

                      {/* Round Routes */}
                      <Route
                        path="/round/create"
                        element={
                          <ReadProgramProvider>
                            <CreateRound />
                          </ReadProgramProvider>
                        }
                      />
                      <Route path="/round/:id" element={viewRoundPage} />
                      <Route
                        path="/chain/:chainId/round/:id"
                        element={viewRoundPage}
                      />
                      <Route
                        path="/chain/:chainId/round/:roundId/application/:id"
                        element={viewApplication}
                      />
                      <Route
                        path="/round/:roundId/application/:id"
                        element={viewApplication}
                      />

                      {/* Program Routes */}
                      <Route
                        path="/program/create"
                        element={<CreateProgram />}
                      />
                      <Route
                        path="/chain/:chainId/program/:id"
                        element={viewProgram}
                      />
                      <Route path="/program/:id" element={viewProgram} />

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
        </QueryClientProvider>
      </WagmiProvider>
    </PostHogProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
