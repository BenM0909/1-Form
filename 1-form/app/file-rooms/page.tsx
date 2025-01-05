'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs, DocumentData } from 'firebase/firestore';

export default function FileRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fileRooms, setFileRooms] = useState<DocumentData[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchFileRooms();
      }
    }
  }, [user, loading, router]);

  const fetchFileRooms = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'fileRooms'), where('organizerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFileRooms(rooms);
    } catch (error) {
      console.error("Error fetching file rooms:", error);
      setError("Failed to fetch file rooms. Please try again later.");
    }
  };

  const createFileRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'fileRooms'), {
        name: newRoomName,
        organizerId: user.uid,
        createdAt: new Date(),
      });
      setNewRoomName('');
      fetchFileRooms();
    } catch (e) {
      setError('Failed to create file room. Please try again.');
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">File Rooms</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New File Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createFileRoom} className="flex items-center space-x-2">
              <Input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                required
              />
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Create</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fileRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/file-rooms/${room.id}`)}>
                  Manage Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

