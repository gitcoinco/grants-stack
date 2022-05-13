import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { store } from './app/store';
import reportWebVitals from './reportWebVitals';
import './index.css';

// Routes
import NewRound from './features/newRound/NewRound';
import Counter from './features/counter/Counter';
import ViewRound from './features/viewRound/ViewRound';
import Dashboard from './features/dashboard/Dashboard';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>

          {/* Default Route */}
          <Route path="/" element={<Dashboard />} />

          {/* Round Manager Routes */}
          <Route path="/round" element={<Dashboard />} />
          <Route path="/round/new" element={<NewRound />} />
          <Route path="/round/:roundId" element={<ViewRound />} />

           {/* Test Routes */}
          <Route path="/test" element={<Counter />} />

        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
