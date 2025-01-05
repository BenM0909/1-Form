'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForms } from '../../hooks/useForms';

export default function JoinedRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joinedRooms, setJoinedRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { forms } = useForms();

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
      const q = query(
        collection(db, 'fileRooms'),
        where(`userAccess.${user.uid}`, '!=', null)
      );
      const querySnapshot = await getDocs(q);
      const rooms = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const roomData = docSnapshot.data();
        const userResponse = await getFilledForm(docSnapshot.id, user.uid);
        return {
          id: docSnapshot.id,
          ...roomData,
          accessInfo: roomData.userAccess[user.uid],
          filledForm: userResponse
        };
      }));
      setJoinedRooms(rooms);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
      setError("Failed to fetch joined rooms. Please try again later.");
    }
  };

  const getFilledForm = async (roomId: string, userId: string) => {
    try {
      const docRef = doc(db, 'fileRooms', roomId, 'responses', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching filled form:", error);
      return null;
    }
  };

  const handleFormChange = async (roomId: string, formId: string) => {
    try {
      const formToUse = forms.find(f => f.id === formId);
      if (!formToUse) {
        throw new Error("Selected form not found");
      }
      
      await updateDoc(doc(db, 'fileRooms', roomId, 'responses', user!.uid), formToUse);
      await fetchJoinedRooms(); // Refresh the data
    } catch (error) {
      console.error("Error updating form:", error);
      setError("Failed to update form. Please try again.");
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
        <Button variant="outline" onClick={() => router.push('/file-rooms')} className="mb-4">
          Back to File Rooms
        </Button>
        <h1 className="text-3xl font-bold mb-8">Joined Rooms</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {joinedRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access Start: {new Date(room.accessInfo.startDate).toLocaleDateString()}</p>
                <p>Access End: {new Date(room.accessInfo.endDate).toLocaleDateString()}</p>
                {room.filledForm ? (
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Your Filled Form:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(room.filledForm, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="mt-4">No form filled yet.</p>
                )}
                <div className="mt-4">
                  <label htmlFor={`form-select-${room.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Select Form:
                  </label>
                  <Select onValueChange={(value) => handleFormChange(room.id, value)}>
                    <SelectTrigger id={`form-select-${room.id}`}>
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.formName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => router.push(`/file-rooms/${room.id}`)} className="mt-4">
                  View Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {joinedRooms.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            You haven't joined any rooms yet.
          </p>
        )}
      </div>
    </Layout>
  );
}

