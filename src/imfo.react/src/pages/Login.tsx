import { useLogto } from '@logto/react';

export default function Login() {
  const { signIn, signOut, isAuthenticated } = useLogto();

  return isAuthenticated ? (
    <button onClick={() => signOut('https://localhost:5173/ ')}>Sign Out</button>
  ) : (
    <button onClick={() => signIn('https://localhost:5173/callback')}>Sign In</button>
  );
}