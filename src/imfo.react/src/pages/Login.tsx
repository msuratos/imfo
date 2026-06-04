import React from 'react';
import { useLogto } from '@logto/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';

export default function Login() {
  const { signIn, isAuthenticated } = useLogto();
  const theme = useTheme();

  React.useEffect(() => {
    if (!isAuthenticated) signIn(`${import.meta.env.VITE_APP_URL}/callback`)
  }, [isAuthenticated]);

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
            {!isAuthenticated
              ? (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Signing In
                  </Typography>

                  <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />

                  <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Redirecting you to authentication...
                  </Typography>
                </>
              )
              : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Authentication Error
                  </Typography>

                  <Alert severity="error" sx={{ width: '100%' }}>
                    Something went wrong during sign in. Please try again.
                  </Alert>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    If the problem persists, please contact support.
                  </Typography>
                </>
              )
            }
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}