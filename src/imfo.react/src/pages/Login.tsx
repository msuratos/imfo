import React from 'react';
import { useLogto } from '@logto/react';

export default function Login() {
  const { signIn, signOut, isAuthenticated } = useLogto();

  React.useEffect(() => {
    if (!isAuthenticated) signIn(`${import.meta.env.VITE_APP_URL}/callback`)
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <button onClick={() => signOut(import.meta.env.VITE_APP_URL)}>Sign Out</button>
  ) : (
    <div>Signing in...</div>
  );
}