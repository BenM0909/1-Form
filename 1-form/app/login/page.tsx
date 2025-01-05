'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '../../components/layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp && !acceptedPolicy) {
        setError('You must accept the Privacy Policy to create an account.');
        return;
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/forms');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/forms');
      }
    } catch (error) {
      const authError = error as AuthError;

      if (authError.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else if (authError.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your input.');
      } else {
        setError('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/forms');
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? 'Sign Up for 1-Form' : 'Sign In to 1-Form'}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {isSignUp
                ? 'Create an account to manage your forms effortlessly'
                : 'Enter your details to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              {isSignUp && (
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="privacy-policy"
                    checked={acceptedPolicy}
                    onChange={() => setAcceptedPolicy(!acceptedPolicy)}
                    className="mt-1"
                  />
                  <label htmlFor="privacy-policy" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex justify-center items-center bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="currentColor"
                />
              </svg>
              {loading ? 'Processing...' : 'Sign in with Google'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAcceptedPolicy(false); // Reset policy checkbox
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}

