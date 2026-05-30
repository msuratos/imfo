import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

type Props = {
  
};

export default function Layout({ children }: PropsWithChildren<Props>) {
  const navigate = useNavigate();
  const { signOut } = useLogto();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileOpen, setProfileOpen] = useState(false);
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

  return (
    <div className="app-root">
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

      <footer className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <button className="nav-btn nav-left" aria-label="Transactions" onClick={() => navigate('/transactions')}>Transactions</button>
        <button className="nav-btn nav-center" aria-label="Home" onClick={() => navigate('/')}>Home</button>
        <button className="nav-btn nav-right" aria-label="Settings" onClick={() => navigate('/settings')}>Settings</button>
      </footer>
    </div>
  );
}
