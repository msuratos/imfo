import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router";

import { LogtoProvider, LogtoConfig } from '@logto/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Budgets from './pages/Budgets';
import Callback from './pages/Callback';
import Categories from './pages/Categories';
import Default from './pages/Default';
import Forecast from './pages/Forecast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

import './styles.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const config: LogtoConfig = {
  endpoint: import.meta.env.VITE_LOGTO_URL,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_API_URL]
};

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <LogtoProvider config={config}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Default />} />
              <Route path="/settings" element={<Budgets />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/transactions" element={<Transactions />} />
            </Route>

            <Route path="/callback" element={<Callback />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </ThemeProvider>
      </LogtoProvider>
    </BrowserRouter>
  )
}
