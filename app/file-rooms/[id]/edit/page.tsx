'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const formFieldOptions = [
  'Child Name',
  'Date of Birth',
  'Gender',
  'Allergies',
  'Medical History',
  'Current Medications',
  'Insurance Provider',
  'Insurance Policy Number',
  'Primary Physician Name',
  'Primary Physician Phone',
  'Parent 1 Name',
  'Parent 1 Home Phone',
  'Parent 1 Cell Phone',
  'Parent 1 Email',
  'Parent 1 Address',
  'Parent 2 Name',
  'Parent 2 Home Phone',
  'Parent 2 Cell Phone',
  'Parent 2 Email',
  'Parent 2 Address',
  'Emergency Contact 1 Name',
  'Emergency Contact 1 Relationship',
  'Emergency Contact 1 Home Phone',
  'Emergency Contact 1 Work Phone',
  'Emergency Contact 1 Cell Phone',
  'Emergency Contact 1 Email',
  'Emergency Contact 2 Name',
  'Emergency Contact 2 Relationship',
  'Emergency Contact 2 Home Phone',
  'Emergency Contact 2 Work Phone',
  'Emergency Contact 2 Cell Phone',
  'Emergency Contact 2 Email',
];

export default function EditForm({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formContent, setFormContent] = useState('');
  const [fieldSelection, setFieldSelection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchFormContent();
      }
    }
  }, [user, loading, router, params.id]);

  const fetchFormContent = async () => {
    try {
      const docRef = doc(db, 'fileRooms', params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormContent(docSnap.data().formContent || '');
      } else {
        setError('File room not found');
      }
    } catch (error) {
      console.error("Error fetching form content:", error);
      setError("Failed to fetch form content. Please try again later.");
    }
  };

  const handleInsertField = () => {
    if (!fieldSelection) return;

    // Convert to proper camelCase format
    const normalizedField = fieldSelection
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    const fieldTag = `{{${normalizedField}}}`;
    setFormContent((prevContent) => prevContent + fieldTag);
    setFieldSelection('');
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'fileRooms', params.id), {
        formContent,
        updatedAt: new Date(),
      });
      setSuccess('Form updated successfully');
      setTimeout(() => {
        router.push(`/file-rooms/${params.id}`);
      }, 2000);
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
        <h1 className="text-3xl font-bold mb-8">Edit Form</h1>
        <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}`)} className="mb-4">
          Back to File Room
        </Button>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Form Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="field-selection" className="block font-semibold mb-2">
                Select a Field to Insert:
              </label>
              <div className="flex gap-2 items-center">
                <Select value={fieldSelection} onValueChange={setFieldSelection}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {formFieldOptions.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleInsertField} disabled={!fieldSelection}>
                  Insert Field
                </Button>
              </div>
            </div>
            <Textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={15}
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}`)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

