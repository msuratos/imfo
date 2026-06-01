import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLogto } from '@logto/react';

import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';

import DataUsageIcon from '@mui/icons-material/DataUsage';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';

type Props = {};

export default function Layout({ children }: PropsWithChildren<Props>) {
  const navigate = useNavigate();
  const { signOut } = useLogto();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileOpen, setProfileOpen] = useState(false);
  const [value, setValue] = React.useState(0);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('imfo_theme');
      if (saved === 'dark' || saved === 'light') setTheme(saved as any);
      else setTheme('light');
    } catch { }
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (e.target instanceof Node && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false);
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('imfo_theme', theme);
    } catch { }
  }, [theme]);

  function handleBottomNavigationClick(event, newValue) {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate('/transactions');
        return;
      case 1:
        navigate('/');
        return;
      case 2:
        navigate('/budgets');
        return;
      default:
        return;
    }
  }

  return (
    <Box>
      <CssBaseline />
      <main className="app-main">
        <div className="top-controls" ref={profileRef} aria-hidden={false}>
          <button className="theme-toggle" aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="profile-menu">
            <button className="profile-btn" aria-haspopup="true" aria-expanded={profileOpen} aria-label="Account" onClick={() => setProfileOpen(!profileOpen)}>👤</button>

            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <button role="menuitem" onClick={() => { setProfileOpen(false); navigate('/profile'); }}>Profile</button>
                <button role="menuitem" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>Settings</button>
                <button role="menuitem" onClick={() => { setProfileOpen(false); signOut(import.meta.env.VITE_APP_URL); }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>

        {children}
      </main>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={value} onChange={handleBottomNavigationClick} showLabels>
          <BottomNavigationAction label="Transactions" icon={<ReceiptIcon />} />
          <BottomNavigationAction label="Usages" icon={<DataUsageIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>

      {/*<footer className="bottom-nav" role="navigation" aria-label="Mobile navigation">*/}
      {/*  <button className="nav-btn nav-left" aria-label="Transactions" onClick={() => navigate('/transactions')}>Transactions</button>*/}
      {/*  <button className="nav-btn nav-center" aria-label="Home" onClick={() => navigate('/')}>Home</button>*/}
      {/*  <button className="nav-btn nav-right" aria-label="Settings" onClick={() => navigate('/budgets')}>Settings</button>*/}
      {/*</footer>*/}
    </Box>
  );
}
