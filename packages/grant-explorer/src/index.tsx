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
import { chains, config } from "./app/wagmi";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

// Routes
import AccessDenied from "./features/common/AccessDenied";
import Auth from "./features/common/Auth";
import NotFound from "./features/common/NotFoundPage";
import ApplyNowPage from "./features/discovery/ApplyNowPage";
import LandingPage from "./features/discovery/LandingPage";
import PassportConnect from "./features/round/PassportConnect";
import ThankYou from "./features/round/ThankYou";
import ViewProjectDetails from "./features/round/ViewProjectDetails";
import ViewRound from "./features/round/ViewRoundPage";
import ViewContributionHistory from "./features/contributors/ViewContributionHistory";
import ViewCart from "./features/round/ViewCartPage/ViewCartPage";
import { ChakraProvider } from "@chakra-ui/react";

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
    <ChakraProvider>
      <WagmiConfig config={config}>
        <RainbowKitProvider coolMode chains={chains}>
          <RoundProvider>
            <HashRouter>
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

                <Route path="/cart" element={<ViewCart />} />

                <Route path="/thankyou" element={<ThankYou />} />

                {/* Passport Connect */}
                <Route
                  path="/round/:chainId/:roundId/passport/connect"
                  element={<PassportConnect />}
                />

                <Route
                  path="/contributors/:address"
                  element={<ViewContributionHistory />}
                />

                {/* Access Denied */}
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </RoundProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
