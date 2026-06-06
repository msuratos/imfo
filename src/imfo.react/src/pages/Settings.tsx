import React from 'react'
import { useNavigate } from 'react-router'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function SettingsHome() {
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Paper sx={{ p: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Settings</Typography>
        <Typography color="text.secondary" variant="body2">
          Select a setting to manage the app and account.
        </Typography>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Available settings</Typography>

        <Stack spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate('/settings/categories')}
            fullWidth
          >
            Manage categories
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
