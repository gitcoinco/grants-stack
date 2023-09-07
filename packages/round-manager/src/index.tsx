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
import { ApplicationProvider } from "./context/application/ApplicationContext";
import { BulkUpdateGrantApplicationProvider } from "./context/application/BulkUpdateGrantApplicationContext";
import { CreateProgramProvider } from "./context/program/CreateProgramContext";
import { ReadProgramProvider } from "./context/program/ReadProgramContext";
import { CreateRoundProvider } from "./context/round/CreateRoundContext";
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

// Initialize sentry
initSentry();

// Initialize datadog
initDatadog();

// Initialize tagmanager
initTagmanager();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <WagmiConfig client={WagmiClient}>
      <RainbowKitProvider coolMode chains={chains}>
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
                    <CreateRoundProvider>
                      <CreateRound />
                    </CreateRoundProvider>
                  </ReadProgramProvider>
                }
              />
              <Route
                path="/round/:id"
                element={
                  <RoundProvider>
                    <ApplicationProvider>
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
                    </ApplicationProvider>
                  </RoundProvider>
                }
              />
              <Route
                path="/round/:roundId/application/:id"
                element={
                  <RoundProvider>
                    <ApplicationProvider>
                      <BulkUpdateGrantApplicationProvider>
                        <ViewApplication />
                      </BulkUpdateGrantApplicationProvider>
                    </ApplicationProvider>
                  </RoundProvider>
                }
              />

              {/* Program Routes */}
              <Route
                path="/program/create"
                element={
                  <CreateProgramProvider>
                    <CreateProgram />
                  </CreateProgramProvider>
                }
              />
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
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
