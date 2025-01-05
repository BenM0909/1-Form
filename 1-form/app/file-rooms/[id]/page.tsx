'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../lib/firebase';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function FileRoom({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [formContent, setFormContent] = useState<string | null>(null);
  const [filledForms, setFilledForms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchRoomData();
        fetchFilledForms();
      }
    }
  }, [user, loading, router, params.id]);

  const fetchRoomData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'fileRooms', params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        setFormContent(data.formContent || null);
        setInviteLink(`${window.location.origin}/join-room/${params.id}`);
      } else {
        setError('File room not found');
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError("Failed to fetch room data. Please try again later.");
    }
  };

  const fetchFilledForms = async () => {
    try {
      const formsRef = collection(db, 'fileRooms', params.id, 'responses');
      const querySnapshot = await getDocs(formsRef);
      const forms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFilledForms(forms);
    } catch (error) {
      console.error("Error fetching filled forms:", error);
      setError("Failed to fetch filled forms. Please try again later.");
    }
  };

  const handleDeleteRoom = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'fileRooms', params.id));
      router.push('/file-rooms');
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room. Please try again later.");
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

  if (!user) {
    return null; // Prevent rendering while redirecting to login
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Manage File Room: {roomData?.name}</h1>
        <Button variant="outline" onClick={() => router.push('/file-rooms')} className="mb-4">
          Back to File Rooms
        </Button>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Invite Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={inviteLink} readOnly />
            <Button className="mt-2" variant="outline" onClick={() => navigator.clipboard.writeText(inviteLink)}>
              Copy Link
            </Button>
          </CardContent>
        </Card>

        {/* Form Content Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{formContent ? 'Assigned Form' : 'Create Form'}</CardTitle>
          </CardHeader>
          <CardContent>
            {formContent ? (
              <div>
                <p className="whitespace-pre-wrap text-gray-600 mb-4">
                  {formContent}
                </p>
                <div className="flex space-x-2">
                  <Link href={`/file-rooms/${params.id}/edit`}>
                    <Button variant="outline">Edit Form</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-gray-600">
                  No form assigned. Create a new form for this file room.
                </p>
                <Button variant="outline" onClick={() => router.push(`/file-rooms/${params.id}/create`)}>
                  Create Form
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filled Forms Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filled Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {filledForms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filledForms.map((form) => (
                  <Card key={form.id}>
                    <CardHeader>
                      <CardTitle>{form.name || 'Unnamed Form'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Submitted by: {form.submittedBy}</p>
                      <p>Submitted at: {new Date(form.submittedAt).toLocaleString()}</p>
                      <Button 
                        className="mt-2"
                        onClick={() => router.push(`/file-rooms/${params.id}/forms/${form.id}`)}
                      >
                        View Form
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No filled forms yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Delete Room Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete File Room</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the file room
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRoom}>
                Yes, delete file room
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

