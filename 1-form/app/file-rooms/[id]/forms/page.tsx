'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export default function FilledForms({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filledForms, setFilledForms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchFilledForms();
      }
    }
  }, [user, loading, router, params.id]);

  const fetchFilledForms = async () => {
    try {
      const q = query(collection(db, 'fileRooms', params.id, 'responses'));
      const querySnapshot = await getDocs(q);
      const forms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched filled forms:', forms);
      setFilledForms(forms);
    } catch (error) {
      console.error("Error fetching filled forms:", error);
      setError("Failed to fetch filled forms. Please try again later.");
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
        <h1 className="text-3xl font-bold mb-8">Filled Forms</h1>
        <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}`)} className="mb-4">
          Back to File Room
        </Button>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filledForms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>Form {form.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                  {form.name ? form.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {form.name || 'Unnamed Form'}
                </p>
                <Button 
                  className="w-full mt-4"
                  onClick={() => router.push(`/file-rooms/${params.id}/forms/${form.id}`)}
                >
                  View Form
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filledForms.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No filled forms yet.
          </p>
        )}
      </div>
    </Layout>
  );
}

