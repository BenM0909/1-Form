'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { decryptData } from '../../../utils/encryption';
import { ErrorBoundary } from 'react-error-boundary';

export default function JoinRoom({ params }: { params: { id: string } }) {
  console.log('JoinRoom component rendered');
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userForms, setUserForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [filledForm, setFilledForm] = useState<string>('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=/join-room/${params.id}`);
      } else {
        fetchRoomData();
        fetchUserForms();
      }
    }
  }, [user, loading, router, params.id]);

  const fetchRoomData = async () => {
    const docRef = doc(db, 'fileRooms', params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setRoomData(data);
      console.log('Room data:', data);
      console.log('Form content:', data.formContent);
    } else {
      setError('File room not found');
    }
  };

  const fetchUserForms = async () => {
    try {
      const userFormsRef = collection(db, 'forms');
      const querySnapshot = await getDocs(userFormsRef);
      const forms = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(form => form.userId === user?.uid);
      setUserForms(forms);
    } catch (e) {
      setError('Failed to fetch user forms. Please try again.');
    }
  };

  const handleFormSelection = (formId: string) => {
    console.log('Form selected:', formId);
    const selected = userForms.find((form) => form.id === formId);
    if (selected && roomData?.formContent) {
      try {
        const decryptedData = decryptData(selected.encryptedData);
        console.log('Decrypted data:', decryptedData);

        if (!decryptedData) {
          throw new Error('Decryption failed or returned empty data');
        }

        let filled = roomData.formContent;
        console.log('Original form content:', filled);

        filled = filled.replace(/{{(.*?)}}/g, (match, key) => {
          console.log(`Attempting to replace key: ${key}`);
          const value = resolveKey(decryptedData, key.trim());
          console.log(`Resolved value for ${key}:`, value);
          return value || match;
        });

        console.log('Filled form content:', filled);
        setFilledForm(filled);
      } catch (e) {
        console.error('Error during form filling:', e);
        setError(`Failed to fill the form: ${e.message}`);
      }
    } else {
      console.log('No form selected or no form content available');
      setFilledForm('');
    }
    setSelectedForm(formId);
  };

  const resolveKey = (data: any, key: string): any => {
    console.log(`Resolving key: ${key}`);
    console.log('Data:', data);
    console.log('Available keys in data:', Object.keys(data));

    const keys = key.split('.');
    let value = data;

    for (const k of keys) {
      console.log(`Accessing key: ${k}`);
      if (k.includes('[') && k.includes(']')) {
        const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
        value = value[arrayKey]?.[parseInt(index, 10)];
      } else {
        value = value?.[k];
      }
      console.log(`Current value:`, value);
      if (value === undefined) {
        console.log(`Key not found: ${k}`);
        break;
      }
    }

    return value !== undefined ? value : '';
  };

  const joinRoom = async () => {
    try {
      await updateDoc(doc(db, 'fileRooms', params.id), {
        connectedUsers: arrayUnion(user?.uid),
      });
      router.push(`/join-room/${params.id}/set-access-time`);
    } catch (e) {
      setError('Failed to join room. Please try again.');
    }
  };

  if (loading || (!user && !roomData)) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Join File Room</h1>
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            Back
          </Button>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {roomData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{roomData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Select a form to auto-fill:</p>
                <select
                  value={selectedForm || ''}
                  onChange={(e) => handleFormSelection(e.target.value)}
                  className="border rounded w-full p-2 mb-4"
                >
                  <option value="" disabled>
                    -- Select a Form --
                  </option>
                  {userForms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.formName || `Unnamed Form (${form.id.slice(0, 8)})`}
                    </option>
                  ))}
                </select>
                <p className="mb-4">Preview Filled Form:</p>
                <textarea
                  value={filledForm}
                  readOnly
                  className="w-full border rounded p-2"
                  rows={10}
                />
                <Button onClick={joinRoom} className="mt-4">
                  Join Room
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

