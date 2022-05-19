import React from 'react';
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import {
  Middleware,
  MiddlewareAPI,
  Dispatch,
} from "redux";

import {
  createRouterMiddleware,
  ReduxRouter,
} from "@lagunovsky/redux-react-router";

import thunkMiddleware from "redux-thunk";
import { Route, Routes } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import './index.css';
import history from "./history";

// Routes
import NewRound from './components/newRound/NewRound';
import ViewRound from './components/viewRound/ViewRound';
import Dashboard from './components/dashboard/Dashboard';
import { configureStore } from '@reduxjs/toolkit';
import { createRootReducer } from './reducers';


const logger: Middleware =
  ({ getState }: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action) => {
    console.log("dispatch", action);
    const returnValue = next(action);
    console.log("state", getState());
    return returnValue;
  };

const routerMiddleware = createRouterMiddleware(history);

let middlewares: Middleware[] = [thunkMiddleware, routerMiddleware];

if (process.env.NODE_ENV !== "production") {
  middlewares = [...middlewares, logger];
}

const store = configureStore({
  reducer: createRootReducer(),
  middleware: middlewares
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReduxRouter history={history} store={store}>
        <Routes>

          {/* Default Route */}
          <Route path="/" element={<Dashboard />} />

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
