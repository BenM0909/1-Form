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
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Layout from '../../components/layout';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { LoadingSpinner } from '../../components/LoadingSpinner';

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set default plan in Firestore
        await setDoc(doc(getFirestore(), 'users', userCredential.user.uid), {
          plan: 'basic',
          displayName: '',
          username: ''
        });
        router.push('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
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
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <LoadingSpinner size={60} color="#4F46E5" />
          <p className="mt-4 text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card>
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
                    <Checkbox
                      id="privacy-policy"
                      checked={acceptedPolicy}
                      onCheckedChange={() => setAcceptedPolicy(!acceptedPolicy)}
                    />
                    <label htmlFor="privacy-policy" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link href="/privacy-policy" target="_blank" className="text-indigo-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size={24} color="#ffffff" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
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
                className="w-full flex justify-center items-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-300 px-4 py-2"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size={24} color="#4285F4" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:underline"
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
        </motion.div>
      </div>
    </Layout>
  );
}

