'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formFieldOptions = [
  'Name',
  'Date of Birth',
  'Gender',
  'Allergies',
  'Medical History',
  'Current Medications',
  'Insurance Provider',
  'Insurance Policy Number',
  'Primary Physician Name',
  'Primary Physician Phone',
  'Primary Contact Name',
  'Primary Contact Home Phone',
  'Primary Contact Cell Phone',
  'Primary Contact Email',
  'Primary Contact Address',
  'Secondary Contact Name',
  'Secondary Contact Home Phone',
  'Secondary Contact Cell Phone',
  'Secondary Contact Email',
  'Secondary Contact Address',
  'Emergency Contact 1 Name',
  'Emergency Contact 1 Relationship',
  'Emergency Contact 1 Home Phone',
  'Emergency Contact 1 Work Phone',
  'Emergency Contact 1 Cell Phone',
  'Emergency Contact 1 Email',
  'Occupation',
  'Employer',
  'Blood Type',
  'Organ Donor',
];

export default function FormWriter({ params }: { params: { id: string } }) {
  const [formContent, setFormContent] = useState('');
  const [fieldSelection, setFieldSelection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

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

    console.log('Inserting field:', normalizedField);

    const fieldTag = `{{${normalizedField}}}`;
    setFormContent((prevContent) => prevContent + fieldTag);
    setFieldSelection('');
  };

  const handleSaveForm = async () => {
    if (!params.id || !formContent) {
      setError('Form content is empty or missing File Room ID.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fileRooms', params.id), {
        formContent,
        updatedAt: new Date(),
      });
      setSuccess('Form saved successfully!');
      setTimeout(() => {
        router.push(`/file-rooms/${params.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving form:', error);
      setError('Failed to save form. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Create Form</h1>
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
              <Button onClick={handleSaveForm} className="bg-red-600 hover:bg-red-700 text-white">Save Form</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

