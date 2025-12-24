import React from 'react';
import { useLogto } from '@logto/react';

export default function Login() {
  const { signIn, signOut, isAuthenticated } = useLogto();

  React.useEffect(() => {
    if (!isAuthenticated) signIn('https://localhost:5173/callback')
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <button onClick={() => signOut('https://localhost:5173/ ')}>Sign Out</button>
  ) : (
    <div>Signing in...</div>
  );
}