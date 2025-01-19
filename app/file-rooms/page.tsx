'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast'
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { decryptData, isEncrypted } from '../../utils/encryption';

const planLimits = {
  basic: 0,
  pro: 4,
  premium: 15,
  enterprise: Infinity
};

export default function FileRooms() {
  const { user, loading, userPlan } = useAuth();
  const router = useRouter();
  const [fileRooms, setFileRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchFileRooms();
    }
  }, [user, loading]);

  const fetchFileRooms = async () => {
  if (!user) return;
  setError(null);
  try {
    let q = query(collection(db, 'fileRooms'), where('organizerId', '==', user.uid));
    
    try {
      // Attempt to fetch with ordering
      const orderedQuery = query(q, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(orderedQuery);
      const rooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const decryptedData = isEncrypted(data.encryptedData) 
          ? decryptData(data.encryptedData) 
          : data;
        return { id: doc.id, ...decryptedData };
      });
      setFileRooms(rooms);
      if (rooms.length === 0) {
        setError("You haven't created any file rooms yet. Create your first room to get started!");
      } else {
        setError(null);
      }
    } catch (indexError) {
      console.warn("Index error, fetching without ordering:", indexError);
      // Fetch without ordering if index doesn't exist
      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const decryptedData = isEncrypted(data.encryptedData) 
          ? decryptData(data.encryptedData) 
          : data;
        return { id: doc.id, ...decryptedData };
      });
      setFileRooms(rooms);
      toast({
        title: "Notice",
        description: "File rooms are not sorted by creation date due to a missing database index. Please contact the administrator for assistance.",
        variant: "warning",
      });
      if (rooms.length === 0) {
        setError("You haven't created any file rooms yet. Create your first room to get started!");
      } else {
        setError(null);
      }
    }

  } catch (error) {
    console.error("Error fetching file rooms:", error);
    setError("Failed to fetch file rooms. Please try again later.");
    toast({
      title: "Error",
      description: "Failed to fetch file rooms. Please try again later.",
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">File Rooms</h1>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
              onClick={() => router.push('/file-rooms/create')}
            >
              Create New File Room
            </Button>
          </div>
          {error && fileRooms.length === 0 && (
            <Alert variant="default" className="mb-8">
              <AlertTitle>Welcome!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
                onClick={() => router.push('/file-rooms/create')}
              >
                Create Your First File Room
              </Button>
            </Alert>
          )}
          {fileRooms.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fileRooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{room.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => router.push(`/file-rooms/${room.id}`)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
                        Manage Room
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

