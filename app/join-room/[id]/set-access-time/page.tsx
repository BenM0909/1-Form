'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { decryptData, isEncrypted } from '../../../../utils/encryption';

export default function SetAccessTime({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('formId');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!formId) {
        setError('Form ID is missing. Please try joining the room again.');
      } else {
        fetchRoomData();
      }
    }
  }, [user, authLoading, router, params.id, formId]);

  const fetchRoomData = async () => {
    setIsLoading(true);
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const encryptedData = roomSnap.data().encryptedData;
        let data;
        if (isEncrypted(encryptedData)) {
          data = decryptData(encryptedData);
        } else {
          console.warn(`Room ${params.id} is not encrypted. Consider re-encrypting.`);
          data = roomSnap.data();
        }
        setRoomData(data);
        setStartDate(data.recommendedStartDate || '');
        setEndDate(data.recommendedEndDate || '');
      } else {
        setError('File room not found');
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError("Failed to fetch room data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAccessTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formId) return;

    try {
      const userAccessRef = doc(db, 'fileRooms', params.id, 'userAccess', formId);
      await setDoc(userAccessRef, {
        startDate,
        endDate,
      }, { merge: true });

      router.push('/joined-rooms');
    } catch (error) {
      console.error("Error setting access time:", error);
      setError("Failed to set access time. Please try again.");
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
    <Layout>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-8">Set Access Time Range</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Select Access Time Range for {roomData?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetAccessTime} className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date (Recommended: {roomData?.recommendedStartDate || 'Not set'})
                </label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date (Recommended: {roomData?.recommendedEndDate || 'Not set'})
                </label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Set Access Time</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

