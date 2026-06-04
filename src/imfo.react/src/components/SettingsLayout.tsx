import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()

  const isIndex = location.pathname === '/settings'

  return (
    <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Settings</Typography>
        {!isIndex && (
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={() => navigate('/settings')}
            variant="outlined"
            size="small"
          >
            Back to menu
          </Button>
        )}
      </Box>

      <Outlet />
    </Box>
  )
}
