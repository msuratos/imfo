import React from 'react'
import { LogtoProvider, LogtoConfig } from '@logto/react';
import { BrowserRouter, Route, Routes } from "react-router";

import Budgets from './pages/Budgets';
import Callback from './pages/Callback';
import Categories from './pages/Categories';
import Default from './pages/Default';
import Forecast from './pages/Forecast';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

import './styles.css'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
          <Route path="/callback" element={<Callback />} />
          <Route path="/settings" element={<Categories />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/login" element={<Login />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
        </BrowserRouter>
    </LogtoProvider>
  )
}
