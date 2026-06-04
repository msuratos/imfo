import React from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '@mui/material/styles';

export default function NotFound() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 2 }}>
          <CardContent
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              padding: 4,
            }}
          >
            <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 64 }} />

            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Page not found
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              The page you are looking for doesn't exist or has been moved.
            </Typography>

            <Button
              onClick={() => navigate('/')}
              variant="contained"
              size="large"
              sx={{ mt: 1 }}
            >
              Go back home
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
