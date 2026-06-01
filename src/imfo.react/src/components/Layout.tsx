import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

import { useLogto } from '@logto/react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';

import AccountCircle from '@mui/icons-material/AccountCircle';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';

type Props = {};

export default function Layout({ children }: PropsWithChildren<Props>) {
  const navigate = useNavigate();
  const { signOut } = useLogto();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  const [value, setValue] = useState<string>(location.pathname);

  const open = Boolean(anchorEl);

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

  function handleBottomNavigationClick(event: React.SyntheticEvent, newValue: string) {
    setValue(newValue);

    // navigate to the selected route (newValue is the action's value)
    navigate(newValue);
  }

  // keep the selected value in sync with the current location so the
  // correct action is selected when routes change or Layout is remounted
  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // toggle menu: if already open, close it; otherwise open anchored to the button
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    // close menu without signing out; sign out is handled by the Logout menu item
    setAnchorEl(null);
  };

  return (
    // make header fixed so children can fill full width/height; header overlays content
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 7 }}>
      <CssBaseline />
      {/* header with left/center content area and right-aligned controls */}
      <Box component="header" sx={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', px: 2, py: 1, pointerEvents: 'none', zIndex: 1200 }}>
        {/* center / flexible space for additional header content */}
        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pointerEvents: 'auto' }}>
          <IconButton
            size="small"
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <LightModeIcon sx={{ width: 24, height: 24 }} />
            ) : (
              <DarkModeIcon sx={{ width: 24, height: 24 }} />
            )}
          </IconButton>

          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <AccountCircle sx={{ width: 24, height: 24 }} />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
          <Avatar /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); signOut(import.meta.env.VITE_APP_URL); }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {children}

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={value} onChange={handleBottomNavigationClick} showLabels>
          <BottomNavigationAction value={'/transactions'} label="Transactions" icon={<ReceiptIcon />} />
          <BottomNavigationAction value={'/'} label="Usages" icon={<DataUsageIcon />} />
          <BottomNavigationAction value={'/settings'} label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
