'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

export default function SetAccessTime({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetAccessTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'fileRooms', params.id), {
        [`userAccess.${user.uid}`]: {
          startDate,
          endDate,
        },
      });
      router.push('/joined-rooms');
    } catch (error) {
      console.error("Error setting access time:", error);
      setError("Failed to set access time. Please try again.");
    }
  };

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
            <CardTitle>Select Access Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetAccessTime} className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
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
                  End Date
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

