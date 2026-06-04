import { useNavigate } from 'react-router';
import { useHandleSignInCallback } from '@logto/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';

export default function Callback() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { isLoading } = useHandleSignInCallback(() => {
    // Navigate to root path when finished
    navigate('/');
  });

  // When it's working in progress
  if (!isLoading) return null;

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
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Loading
            </Typography>

            <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />

            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Redirecting...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
};