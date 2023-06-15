import "./browserPatches";

import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { RoundProvider } from "./context/RoundContext";
import { initDatadog } from "./datadog";
import { initSentry } from "./sentry";
import { initTagmanager } from "./tagmanager";

import { store } from "./app/store";
import { chains, client as WagmiClient } from "./app/wagmi";
import history from "./history";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

// Routes
import { CartProvider } from "./context/CartContext";
import { QFDonationProvider } from "./context/QFDonationContext";
import AccessDenied from "./features/common/AccessDenied";
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import ApplyNowPage from "./features/discovery/ApplyNowPage";
import LandingPage from "./features/discovery/LandingPage";
import PassportConnect from "./features/round/PassportConnect";
import ThankYou from "./features/round/ThankYou";
import ViewCart from "./features/round/ViewCartPage";
import ViewProjectDetails from "./features/round/ViewProjectDetails";
import ViewRound from "./features/round/ViewRoundPage";
import ViewContributionHistory from "./features/contributors/ViewContributionHistory";

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
            <CartProvider>
              <ReduxRouter history={history} store={store}>
                <Routes>
                  {/* Protected Routes */}
                  <Route element={<Auth />} />

                  {/* Default Route */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Apply Now Page */}
                  <Route path="/apply-now" element={<ApplyNowPage />} />

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
                    path="/round/:chainId/:roundId/cart"
                    element={
                      <QFDonationProvider>
                        <ViewCart />
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

                  <Route
                    path="/contributor/:address"
                    element={<ViewContributionHistory />}
                  />

                  {/* Access Denied */}
                  <Route path="/access-denied" element={<AccessDenied />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ReduxRouter>
            </CartProvider>
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
