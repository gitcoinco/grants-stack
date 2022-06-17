import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { ReduxRouter } from "@lagunovsky/redux-react-router"
import { store } from "./app/store";
import { Route, Routes } from "react-router-dom"
import reportWebVitals from "./reportWebVitals"
import history from "./history"

import "./index.css"


// Routes
import ProtectedRoute from "./features/common/ProtectedRoute"
import ListCartItems from "./features/cart/ListCartItemsPage"
import ListGrants from "./features/explorer/ListGrantsPage"


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReduxRouter history={history} store={store}>
        <Routes>
          <Route path="/" element={<ListGrants />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>

            {/* Default Route */}

            {/* Cart Routes */}
            <Route path="/cart" element={<ListCartItems />} />

          </Route>

          {/* 404 */}
          <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
      </ReduxRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
