import React from 'react';
import ReactDOM from 'react-dom/client';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { createRootReducer } from './reducers';
import ErrorBoundary from './components/ErrorBoundary';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const logger: Middleware = ({ getState }: MiddlewareAPI) => (next: Dispatch) => action => {
  console.log('dispatch', action);
  const returnValue = next(action);
  console.log('state', getState());
  return returnValue;
}

let middlewares: Middleware[] = [
  thunkMiddleware,
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
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
