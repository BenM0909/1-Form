'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../hooks/useAuth';
import Layout from '../../../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

interface FilledFormData {
  displayName: string;
  filledForm: string;
  selectedForm: string;
  startDate: string;
  endDate: string;
}

export default function ViewFilledForm({ params }: { params: { id: string; formId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FilledFormData | null>(null);
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
      const userAccessRef = doc(db, 'fileRooms', params.id, 'userAccess', params.formId);
      const userAccessSnap = await getDoc(userAccessRef);
    
      if (!userAccessSnap.exists()) {
        setError('Form not found');
        return;
      }

      const userRef = doc(db, 'users', params.formId);
      const userSnap = await getDoc(userRef);
      const displayName = userSnap.exists() ? userSnap.data().displayName : 'Unknown User';

      const data = userAccessSnap.data();
      setFormData({
        displayName,
        filledForm: data.filledForm || '',
        selectedForm: data.selectedForm || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
      });
    } catch (error) {
      console.error("Error fetching form data:", error);
      setError("Failed to fetch form data. Please try again later.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      // Adjust for timezone offset
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return format(adjustedDate, 'MMM d, yyyy');
    } catch {
      return dateString;
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">View Filled Form</h1>
          <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}/forms`)}>
            Back to Forms
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {formData && (
          <Card>
            <CardHeader>
              <CardTitle>{formData.displayName}'s Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Access Start Date</p>
                  <p className="text-lg">{formatDate(formData.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Access End Date</p>
                  <p className="text-lg">{formatDate(formData.endDate)}</p>
                </div>
              </div>

              {(() => {
                const now = new Date();
                const start = new Date(formData.startDate);
                const end = new Date(formData.endDate);
                const isWithinAccessPeriod = now >= start && now <= end;

                if (isWithinAccessPeriod) {
                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Form Content</h3>
                      <div className="p-4 bg-white border rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans">
                          {formData.filledForm || 'No content available'}
                        </pre>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Alert>
                      <AlertTitle>Access Restricted</AlertTitle>
                      <AlertDescription>
                        The form content is only viewable within the specified access dates.
                      </AlertDescription>
                    </Alert>
                  );
                }
              })()}

              <div>
                <p className="text-sm text-gray-500">
                  Form ID: {formData.selectedForm}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

