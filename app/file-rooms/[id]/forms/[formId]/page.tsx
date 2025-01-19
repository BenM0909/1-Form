'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import Layout from '../../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ViewFilledForm({ params }: { params: { id: string, formId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchFormData();
      }
    }
  }, [user, loading, router, params.id, params.formId]);

  const fetchFormData = async () => {
    try {
      const docRef = doc(db, 'fileRooms', params.id, 'userAccess', params.formId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Fetched form data:', data);
        setFormData(data);
      } else {
        setError('Form not found');
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
      setError("Failed to fetch form data. Please try again later.");
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
        <h1 className="text-3xl font-bold mb-8">View Filled Form</h1>
        <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}/forms`)} className="mb-4">
          Back to Forms
        </Button>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {formData && (
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Selected Form:</strong> {formData.selectedForm || 'Not selected'}</p>
              <p><strong>Access Start:</strong> {formData.startDate || 'Not set'}</p>
              <p><strong>Access End:</strong> {formData.endDate || 'Not set'}</p>
              <h3 className="text-xl font-semibold mt-4 mb-2">Filled Form Content:</h3>
              <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
                {formData.filledForm || 'No content available'}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

