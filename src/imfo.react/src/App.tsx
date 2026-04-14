import React from 'react'
import { LogtoProvider, LogtoConfig } from '@logto/react';
import { BrowserRouter, Route, Routes } from "react-router";

import Budgets from './pages/Budgets';
import Callback from './pages/Callback';
import Categories from './pages/Categories';
import Default from './pages/Default';
import Forecast from './pages/Forecast';
import Login from './pages/Login';
import ScheduledTransactions from './pages/ScheduledTransactions';

import './styles.css'

const config: LogtoConfig = {
  endpoint: import.meta.env.VITE_LOGTO_URL,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_API_URL]
};

export default function App() {
  return (
    <LogtoProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/scheduled-transactions" element={<ScheduledTransactions />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        </BrowserRouter>
    </LogtoProvider>
  )
}
