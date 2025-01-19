'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { updatePassword, deleteUser, updateProfile, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Label } from "@/components/ui/label";

const firestore = getFirestore();

export default function AccountPage() {
  const { user, loading, userPlan } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || '');
          setUsername(data.username ? `@${data.username.replace(/^@/, '')}` : '');
        } else {
          setDisplayName(user.displayName || '');
        }
      };

      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-bold">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const isUsernameAvailable = async (usernameToCheck: string) => {
    const usersCollection = collection(firestore, 'users');
    const q = query(usersCollection, where('username', '==', usernameToCheck));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // If empty, the username is available
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formattedUsername = username.replace(/^@/, ''); // Remove the @ prefix for saving

    try {
      if (!(await isUsernameAvailable(formattedUsername))) {
        setError('Username is already taken. Please choose another.');
        return;
      }

      await updateProfile(user as User, { displayName });
      const userDoc = doc(firestore, 'users', user.uid);
      await setDoc(userDoc, { displayName, username: formattedUsername }, { merge: true });

      setSuccess('Profile updated successfully.');
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updatePassword(user as User, newPassword);
      setSuccess('Password updated successfully.');
      setNewPassword('');
    } catch (error) {
      setError('Failed to update password. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const userDoc = doc(firestore, 'users', user.uid);
        await setDoc(userDoc, {}, { merge: false });
        await deleteUser(user as User);
        router.push('/');
      } catch (error) {
        setError('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 space-y-8 max-w-4xl">
        {!displayName || !username ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Please complete your profile</AlertTitle>
            <AlertDescription>
              To fully utilize 1-Form, please set up your display name and username below.
            </AlertDescription>
          </Alert>
        ) : null}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Account Settings</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="display-name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(`@${e.target.value.replace(/^@/, '')}`)}
                    placeholder="Enter your username"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a new password"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Account Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                <p className="mt-1 text-lg capitalize">{userPlan}</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}

