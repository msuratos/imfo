import { Outlet, useLocation, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  const isIndexRoute = location.pathname === '/settings';

  return (
    <Box component="main" sx={{ maxWidth: 1200, margin: 'auto' }}>
      {!isIndexRoute && (
        <Button
          startIcon={<ArrowBackIosNewIcon />}
          onClick={() => navigate('/settings')}
          sx={{ ml: 1 }}
          variant="outlined"
          size="small"
        >
          Back to menu
        </Button>
      )}

      <Outlet />
    </Box>
  )
}
