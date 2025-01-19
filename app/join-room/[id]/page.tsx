'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, getDocs } from 'firebase/firestore';
import { decryptData, isEncrypted, isLegacyData } from '../../../utils/encryption';
import { ErrorBoundary } from 'react-error-boundary';
import { useForms } from '../../../hooks/useForms';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { v4 as uuidv4 } from 'uuid';

export default function JoinRoom({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { forms } = useForms();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [filledForm, setFilledForm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [existingForms, setExistingForms] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/join-room/${params.id}`);
      } else {
        fetchRoomData();
        fetchExistingForms();
      }
    }
  }, [user, authLoading, router, params.id]);

  const fetchRoomData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        setRoomData(roomData);
        if (roomData.formContent) {
          
        } else {
          setError('This room does not have a form template. Please contact the room administrator.');
        }
      } else {
        setError('File room not found. Please check the invite link and try again.');
      }
    } catch (e) {
      console.error("Error fetching room data:", e);
      setError('Failed to fetch room data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingForms = async () => {
    if (!user) return;
    try {
      const userAccessRef = collection(db, 'fileRooms', params.id, 'userAccess');
      const userAccessSnapshot = await getDocs(userAccessRef);
      const existingForms = userAccessSnapshot.docs
        .filter(doc => doc.id.startsWith(user.uid))
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            selectedForm: data.selectedForm,
            startDate: data.startDate,
            endDate: data.endDate,
          };
        });
      setExistingForms(existingForms);
    } catch (error) {
      console.error("Error fetching existing forms:", error);
    }
  };

  const handleFormSelection = (formId: string) => {
    console.log('Form selection started with ID:', formId);
    setSelectedForm(formId);
    const selected = forms.find((form) => form.id === formId);
    
    if (!selected) {
      console.error('Selected form not found');
      setError('Selected form not found');
      return;
    }

    if (!roomData?.formContent) {
      console.error('No form content available in room data');
      setError('This room does not have a form template. Please contact the room administrator.');
      return;
    }

    try {
      console.log('Processing form data:', selected);
      const formData = selected;

      if (!formData) {
        throw new Error('Failed to process form data');
      }

      console.log('Form data processed successfully:', formData);
      let filled = roomData.formContent;
      
      filled = filled.replace(/{{(.*?)}}/g, (match, key) => {
        const value = resolveKey(formData, key.trim());
        console.log(`Replacing ${key} with:`, value);
        return value !== undefined && value !== null ? value : match;
      });

      console.log('Form filled successfully');
      setFilledForm(filled);
      setError(null);
    } catch (e) {
      console.error('Error during form filling:', e);
      setError(`Failed to fill the form: ${e.message}`);
      setFilledForm('');
    }
  };

  const resolveKey = (data: any, key: string): any => {
    console.log(`Resolving key: ${key} in data:`, data);
    if (!data || !key) {
      console.warn('Invalid data or key provided to resolveKey');
      return '';
    }

    const keys = key.split('.');
    let value = data;

    for (const k of keys) {
      if (value === null || value === undefined) {
        console.warn(`Value became ${value} while resolving ${k}`);
        return '';
      }
      if (k.includes('[') && k.includes(']')) {
        const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
        value = value[arrayKey]?.[parseInt(index, 10)];
      } else {
        value = value[k];
      }
      console.log(`After resolving ${k}, value is:`, value);
    }

    return value !== undefined && value !== null ? value : '';
  };

  const joinRoom = async () => {
    if (!user || !selectedForm) {
      setError('Please select a form before joining the room.');
      return;
    }

    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      await updateDoc(roomRef, {
        connectedUsers: arrayUnion(user.uid),
      });

      const formId = `${user.uid}_${uuidv4()}`;
      const userAccessRef = doc(db, 'fileRooms', params.id, 'userAccess', formId);
      await setDoc(userAccessRef, {
        userId: user.uid,
        selectedForm: selectedForm,
        filledForm: filledForm,
      });

      router.push(`/join-room/${params.id}/set-access-time?formId=${formId}`);
    } catch (e) {
      console.error('Failed to join room:', e);
      setError('Failed to join room. Please try again.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size={40} color="#4F46E5" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
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
          {roomData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{roomData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {roomData.formContent ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Your Existing Forms in This Room</h2>
                    {existingForms.length > 0 ? (
                      <div className="mb-6">
                        {existingForms.map((form, index) => (
                          <div key={form.id} className="mb-2 p-2 border rounded">
                            <p>Form {index + 1}: {form.selectedForm}</p>
                            <p>Access Period: {form.startDate} - {form.endDate}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-4">You haven't joined this room with any forms yet.</p>
                    )}
                    <h2 className="text-xl font-semibold mb-4">Join with a New Form</h2>
                    <p className="mb-4">Select a form to auto-fill:</p>
                    <select
                      value={selectedForm || ''}
                      onChange={(e) => handleFormSelection(e.target.value)}
                      className="border rounded w-full p-2 mb-4"
                    >
                      <option value="" disabled>
                        -- Select a Form --
                      </option>
                      {forms.map((form) => (
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
                    <Button onClick={joinRoom} className="mt-4" disabled={!selectedForm}>
                      Join Room with This Form
                    </Button>
                  </>
                ) : (
                  <p className="text-red-500">This room does not have a form template. Please contact the room administrator.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

