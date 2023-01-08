import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { RoundProvider } from "./context/RoundContext";
import { Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { initDatadog } from "./datadog";
import { initSentry } from "./sentry";
import { initTagmanager } from "./tagmanager";

import { store } from "./app/store";
import { chains, client as WagmiClient } from "./app/wagmi";
import reportWebVitals from "./reportWebVitals";
import history from "./history";

import "./index.css";

// Routes
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import AccessDenied from "./features/common/AccessDenied";
import ViewRound from "./features/round/ViewRoundPage";
import ViewProjectDetails from "./features/round/ViewProjectDetails";
import { BallotProvider } from "./context/BallotContext";
import ViewBallot from "./features/round/ViewBallotPage";
import PassportConnect from "./features/round/PassportConnect";
import { QFDonationProvider } from "./context/QFDonationContext";
import ThankYou from "./features/round/ThankYou";

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
    <Provider store={store}>
      <WagmiConfig client={WagmiClient}>
        <RainbowKitProvider coolMode chains={chains}>
          <RoundProvider>
            <BallotProvider>
              <ReduxRouter history={history} store={store}>
                <Routes>
                  {/* Protected Routes */}
                  <Route element={<Auth />} />

                  {/* Default Route */}
                  <Route path="/" element={<NotFound />} />

                  {/* Round Routes */}
                  <Route
                    path="/round/:chainId/:roundId"
                    element={<ViewRound />}
                  />
                  <Route
                    path="/round/:chainId/:roundId/:applicationId"
                    element={<ViewProjectDetails />}
                  />

                  <Route
                    path="/round/:chainId/:roundId/ballot"
                    element={
                      <QFDonationProvider>
                        <ViewBallot />
                      </QFDonationProvider>
                    }
                  />

                  <Route
                    path="/round/:chainId/:roundId/:txHash/thankyou"
                    element={
                      <QFDonationProvider>
                        <ThankYou />
                      </QFDonationProvider>
                    }
                  />

                  {/* Passport Connect */}
                  <Route
                    path="/round/:chainId/:roundId/passport/connect"
                    element={<PassportConnect />}
                  />

                  {/* Access Denied */}
                  <Route path="/access-denied" element={<AccessDenied />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ReduxRouter>
            </BallotProvider>
          </RoundProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
