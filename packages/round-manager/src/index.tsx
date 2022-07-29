import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { ReduxRouter } from "@lagunovsky/redux-react-router"
import { Route, Routes } from "react-router-dom"
import { WagmiConfig } from "wagmi"

import { store } from "./app/store"
import { client as WagmiClient } from "./app/wagmi"
import reportWebVitals from "./reportWebVitals"
import history from "./history"

import "./index.css"


// Routes
import CreateProgram from "./features/program/CreateProgramPage"
import CreateRound from "./features/round/CreateRoundPage"
import Program from "./features/program/ListProgramPage"
import ProtectedRoute from "./features/common/ProtectedRoute"
import ViewProgram from "./features/program/ViewProgramPage"
import ViewRound from "./features/round/ViewRoundPage"
import ViewApplication from "./features/round/ViewApplicationPage"


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig client={WagmiClient}>
        <ReduxRouter history={history} store={store}>
          <Routes>
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>

              {/* Default Route */}
              <Route path="/" element={<Program />} />

              {/* Round Routes */}
              <Route path="/round/create" element={<CreateRound />} />
              <Route path="/round/:id" element={<ViewRound />} />
              <Route path="/round/:roundId/application/:id" element={<ViewApplication />} />

              {/* Program Routes */}
              <Route path="/program/create" element={<CreateProgram />} />
              <Route path="/program/:id" element={<ViewProgram />} />

              {/* 404 */}
              <Route path="*" element={<p>There's nothing here: 404!</p>} />
            </Route>
          </Routes>
        </ReduxRouter>
      </WagmiConfig>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
