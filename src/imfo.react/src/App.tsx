import React from 'react'
import { LogtoProvider, LogtoConfig } from '@logto/react';
import { BrowserRouter, Route, Routes } from "react-router";

import Callback from './pages/Callback';
import Default from './pages/Default';

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
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </BrowserRouter>
    </LogtoProvider>
  )
}
