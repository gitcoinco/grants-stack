import React from 'react';
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { store } from './app/store';
import { Route, Routes } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import history from "./history";

import './index.css';


// Routes
import NewRound from './features/round/NewRound';
import ViewRound from './features/round/ViewRound';
import Program from './features/program/Program';


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReduxRouter history={history} store={store}>
        <Routes>

          {/* Default Route */}
          <Route path="/" element={<Program />} />

          {/* Round Manager Routes */}
          <Route path="/round/new" element={<NewRound />} />
          <Route path="/round/:roundId" element={<ViewRound />} />

        </Routes>
      </ReduxRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
