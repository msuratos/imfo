import React from 'react';
import { useLogto } from '@logto/react';

export default function Login() {
  const { signIn, signOut, isAuthenticated } = useLogto();

  React.useEffect(() => {
    if (!isAuthenticated) signIn(`${import.meta.env.VITE_APP_URL}/callback`)
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <div>Something went wrong during sign in.</div>
  ) : (
    <div>Signing in...</div>
  );
}