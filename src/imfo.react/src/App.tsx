import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router";

import { LogtoProvider, LogtoConfig } from '@logto/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Budgets from './pages/Budgets';
import Callback from './pages/Callback';
import Categories from './pages/Categories';
import Default from './pages/Default';
import Forecast from './pages/Forecast';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

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
    <LogtoProvider config={config}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Default />} />
            <Route path="/settings" element={<Budgets />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/login" element={<Login />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LogtoProvider>
  )
}
