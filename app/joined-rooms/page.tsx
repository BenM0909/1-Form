'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { decryptData, isEncrypted } from '../../utils/encryption';

interface JoinedRoom {
  id: string;
  name: string;
  forms: {
    id: string;
    selectedForm: string;
    startDate: string;
    endDate: string;
  }[];
}

export default function JoinedRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joinedRooms, setJoinedRooms] = useState<JoinedRoom[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchJoinedRooms();
      }
    }
  }, [user, loading, router]);

  const fetchJoinedRooms = async () => {
    if (!user) return;
    
    try {
      const fileRoomsRef = collection(db, 'fileRooms');
      const fileRoomsSnapshot = await getDocs(fileRoomsRef);
      const rooms: JoinedRoom[] = [];

      for (const fileRoomDoc of fileRoomsSnapshot.docs) {
        const userAccessRef = collection(db, 'fileRooms', fileRoomDoc.id, 'userAccess');
        const userAccessSnapshot = await getDocs(userAccessRef);
        
        const userForms = userAccessSnapshot.docs
          .filter(doc => doc.id.startsWith(user.uid))
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              selectedForm: data.selectedForm || '',
              startDate: data.startDate || '',
              endDate: data.endDate || '',
            };
          });

        if (userForms.length > 0) {
          const roomData = fileRoomDoc.data();
          const decryptedData = isEncrypted(roomData.encryptedData)
            ? decryptData(roomData.encryptedData)
            : roomData;
          rooms.push({
            id: fileRoomDoc.id,
            name: decryptedData.name || 'Unnamed Room',
            forms: userForms,
          });
        }
      }

      console.log("Fetched joined rooms:", rooms);
      setJoinedRooms(rooms);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
      setError("Failed to fetch joined rooms. Please try again later.");
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Joined Rooms</h1>
          <Button variant="outline" onClick={() => router.push('/file-rooms')} className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300">
            Back to File Rooms
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {joinedRooms.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">
            You haven't joined any rooms yet.
          </p>
        ) : (
          <div className="space-y-6">
            {joinedRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">{room.name}</h2>
                    <div className="space-y-4">
                      {room.forms.map((form) => (
                        <div key={form.id} className="bg-gray-100 p-4 rounded-lg">
                          <p><strong>Form ID:</strong> {form.id}</p>
                          <p><strong>Selected Form:</strong> {form.selectedForm}</p>
                          <p><strong>Access Period:</strong> {form.startDate} to {form.endDate}</p>
                          <Link href={`/joined-rooms/${room.id}?formId=${form.id}`}>
                            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
                              View Form
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

