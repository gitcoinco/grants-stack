import './browserPatches';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes } from "react-router";
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { createRootReducer } from './reducers';
import { createRouterMiddleware } from "@lagunovsky/redux-react-router";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import Layout from "./components/Layout";
import GrantsList from "./components/grants/List";
import GrantsShow from "./components/grants/Show";
import App from './App';
import reportWebVitals from './reportWebVitals';
import { browserHistory } from "./history";

const logger: Middleware = ({ getState }: MiddlewareAPI) => (next: Dispatch) => action => {
  console.log('dispatch', action);
  const returnValue = next(action);
  console.log('state', getState());
  return returnValue;
}

const routerMiddleware = createRouterMiddleware(browserHistory);

let middlewares: Middleware[] = [
  thunkMiddleware,
  routerMiddleware,
];

if (process.env.NODE_ENV !== 'production') {
  middlewares = [
    ...middlewares,
    logger
  ];
}

const store = createStore(
  createRootReducer(),
  applyMiddleware(...middlewares),
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


const rootSlug = process.env.NODE_ENV === "production" ? "/grants-hub" : "";

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <Layout>
          <ReduxRouter history={browserHistory} store={store}>
            <Routes>
              <Route path={`${rootSlug}/`} element={<App />} />
              <Route path={`${rootSlug}/grants`} element={<GrantsList />} />
              <Route path={`${rootSlug}/grants/:id`} element={<GrantsShow />} />
              <Route path={`${rootSlug}/test`} element={<>test</>} />
            </Routes>
          </ReduxRouter>
        </Layout>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
