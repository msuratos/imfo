import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';

import { useLogto } from '@logto/react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import AccountCircle from '@mui/icons-material/AccountCircle';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';

type Props = {};

export default function Layout({ children }: PropsWithChildren<Props>) {
  const { mode, setMode } = useColorScheme();
  const { isAuthenticated, isLoading, signOut } = useLogto();
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<string>(location.pathname);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!isAuthenticated && !isLoading)
      navigate('/login');
  }, [isAuthenticated, isLoading]);

  function handleAccountButtonClick(event: React.MouseEvent<HTMLElement>) {
    // toggle menu: if already open, close it; otherwise open anchored to the button
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  }

  function handleBottomNavigationClick(event: React.SyntheticEvent, newValue: string) {
    setValue(newValue);
    navigate(newValue);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 7 }}>
      <CssBaseline />

      <Grid container spacing={1} sx={{ pt: 1, px: 1 }}>
        <Grid size={6}>
          <Typography variant="h6" noWrap>
            Imfo
          </Typography>
        </Grid>

        <Grid size={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
            {mode === 'dark'
              ? (
                <LightModeIcon sx={{ width: 24, height: 24 }} />
              )
              : (
                <DarkModeIcon sx={{ width: 24, height: 24 }} />
              )
            }
          </IconButton>

          <IconButton size="small" onClick={handleAccountButtonClick}>
            <AccountCircle sx={{ width: 24, height: 24 }} />
          </IconButton>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              overflow: 'visible',
              '& .MuiAvatar-root': {
                height: 32,
                ml: -0.5,
                mr: 1,
                width: 32
              },
              '&::before': {
                bgcolor: 'background.paper',
                content: '""',
                display: 'block',
                height: 10,
                position: 'absolute',
                right: 14,
                top: 0,
                transform: 'translateY(-50%) rotate(45deg)',
                width: 10,
                zIndex: 0
              }
            }
          }
        }}
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

      <Outlet />

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={value} onChange={handleBottomNavigationClick} showLabels>
          <BottomNavigationAction value={'/forecast'} label="Forecast" icon={<TimelineIcon />} />
          <BottomNavigationAction value={'/transactions'} label="Transactions" icon={<ReceiptIcon />} />
          <BottomNavigationAction value={'/'} label="Usages" icon={<DataUsageIcon />} />
          <BottomNavigationAction value={'/allocations'} label="Allocations" icon={<PaymentsIcon />} />
          <BottomNavigationAction value={'/settings'} label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
