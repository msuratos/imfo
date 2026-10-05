import { useEffect } from 'react';
import { useLogto } from '@logto/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

export default function SessionExpired() {
  const { signOut } = useLogto();
  const theme = useTheme();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void signOut(import.meta.env.VITE_APP_URL);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [signOut]);

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
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Session expired
            </Typography>
            <Alert severity="warning">
              You were signed out because the server returned 401 Unauthorized. Please sign in again.
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Redirecting you to sign in shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => signOut(import.meta.env.VITE_APP_URL)}
            >
              Sign in now
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}