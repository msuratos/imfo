import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

type Props = {
  title?: string;
  subtitle?: string;
};

export default function Layout({ title = 'Imfo', subtitle = '', children }: PropsWithChildren<Props>) {
  const navigate = useNavigate();
  const { signOut } = useLogto();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('imfo_theme');
      if (saved === 'dark' || saved === 'light') setTheme(saved as any);
      else setTheme('light');
    } catch { }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('imfo_theme', theme);
    } catch { }
  }, [theme]);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <h1 title="Is My Finances Okay?">{title}</h1>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>

          <div className="header-controls">
            <div className="header-actions" data-open={mobileMenuOpen}>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/'); }}>Transactions</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/scheduled-transactions'); }}>Schedules</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/budgets'); }}>Budgets</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/forecast'); }}>Forecast</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/categories'); }}>Categories</button>
              <button onClick={() => { setMobileMenuOpen(false); signOut(import.meta.env.VITE_APP_URL); }}>Sign Out</button>
            </div>

            <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">{mobileMenuOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
