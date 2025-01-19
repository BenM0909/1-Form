'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForms } from '../../../hooks/useForms';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { collection, query, where, getDocs } from 'firebase/firestore';


export default function EditJoinedRoom({ params }: { params: { id: string } }) {
  console.log("EditJoinedRoom component rendered");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [filledForm, setFilledForm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { forms } = useForms();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Added state for AlertDialog

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchRoomData();
      }
    }
  }, [user, loading, router, params.id]);

  const fetchRoomData = async () => {
    if (!user) return;
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      const roomSnap = await getDoc(roomRef);
  
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        setRoomData(roomData);

        // Fetch all userAccess documents for this user
        const userAccessRef = collection(db, 'fileRooms', params.id, 'userAccess');
        const userAccessQuery = query(userAccessRef, where('userId', '==', user.uid));
        const userAccessSnapshot = await getDocs(userAccessQuery);
      
        if (!userAccessSnapshot.empty) {
          // Assuming we want the most recent form, we'll take the first one
          const userAccessData = userAccessSnapshot.docs[0].data();
          setSelectedForm(userAccessData.selectedForm || '');
          setFilledForm(userAccessData.filledForm || '');
          setStartDate(userAccessData.startDate || '');
          setEndDate(userAccessData.endDate || '');
        } else {
          setError('No filled form found for this user in this room.');
        }
      } else {
        setError('Room not found');
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError("Failed to fetch room data. Please try again later.");
    }
  };

  const handleFormChange = async (formId: string) => {
    setSelectedForm(formId);
    const selected = forms.find((form) => form.id === formId);
    if (selected && roomData?.formContent) {
      try {
        let formData: any;
        if (typeof selected === 'object' && 'formName' in selected) {
          // The form data is already decrypted
          formData = selected;
        } else {
          console.error('Unexpected form data structure:', selected);
          setError('Unable to process the selected form. Please try again.');
          return;
        }

        let filled = roomData.formContent;
        filled = filled.replace(/{{(.*?)}}/g, (match, key) => {
          const value = resolveKey(formData, key.trim());
          return value !== undefined && value !== null ? value : match;
        });

        setFilledForm(filled);
        setError(null);
      } catch (e) {
        console.error('Error during form filling:', e);
        setError(`Failed to fill the form: ${e.message}`);
        setFilledForm('');
      }
    } else {
      setFilledForm('');
      if (!selected) {
        setError('Selected form not found. Please try again.');
      } else if (!roomData?.formContent) {
        setError('No form content available for this room.');
      }
    }
  };

  const resolveKey = (data: any, key: string): any => {
    const keys = key.split('.');
    let value = data;

    for (const k of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (k.includes('[') && k.includes(']')) {
        const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
        value = value[arrayKey]?.[parseInt(index, 10)];
      } else {
        value = value[k];
      }
    }

    return value;
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const userAccessRef = doc(db, 'fileRooms', params.id, 'userAccess', user.uid);
      await updateDoc(userAccessRef, {
        selectedForm,
        filledForm,
        startDate,
        endDate,
      });
      router.push('/joined-rooms');
    } catch (error) {
      console.error("Error updating room data:", error);
      setError("Failed to update room data. Please try again.");
    }
  };

  const handleDeleteRoom = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'fileRooms', params.id));
      router.push('/joined-rooms');
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room. Please try again later.");
    }
  };

  const handleDeleteUserForm = async () => {
  console.log("handleDeleteUserForm function called");
  if (!user) {
    console.error("No user found");
    setError("User not authenticated. Please log in and try again.");
    return;
  }
  try {
    console.log("Starting deletion process for user", user.uid, "in room", params.id);

    // Get the specific userAccess document for this user and this room
    const userAccessRef = collection(db, 'fileRooms', params.id, 'userAccess');
    const userAccessQuery = query(userAccessRef, where('userId', '==', user.uid));
    const userAccessSnapshot = await getDocs(userAccessQuery);

    if (userAccessSnapshot.empty) {
      console.error("No user access document found");
      setError("No form found for this user in this room.");
      return;
    }

    // There should only be one document, but we'll check just in case
    const userAccessDoc = userAccessSnapshot.docs[0];
    await deleteDoc(userAccessDoc.ref);
    console.log("User access document deleted successfully");

    // Check if this was the last form for this user in this room
    const remainingFormsQuery = query(userAccessRef, where('userId', '==', user.uid));
    const remainingFormsSnapshot = await getDocs(remainingFormsQuery);

    if (remainingFormsSnapshot.empty) {
      // If this was the last form, remove the user from the connectedUsers array
      const fileRoomRef = doc(db, 'fileRooms', params.id);
      console.log("Removing user from connectedUsers array");
      await updateDoc(fileRoomRef, {
        connectedUsers: arrayRemove(user.uid)
      });
      console.log("User removed from connectedUsers array");
    } else {
      console.log("User still has other forms in this room, not removing from connectedUsers");
    }

    toast({
      title: "Success",
      description: "Your form has been deleted successfully.",
    });

    // Reset local state
    setSelectedForm('');
    setFilledForm('');
    setStartDate('');
    setEndDate('');
    setError(null);

    console.log("Local state reset, redirecting to joined rooms page");
    // Redirect to joined rooms page
    router.push('/joined-rooms');
  } catch (error) {
    console.error("Error deleting user form:", error);
    setError(`Failed to delete your form: ${error.message}`);
    toast({
      title: "Error",
      description: `Failed to delete your form: ${error.message}`,
      variant: "destructive",
    });
  }
};

  if (loading || !roomData) {
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
        <Button variant="outline" onClick={() => router.push('/joined-rooms')} className="mb-4">
          Back to Joined Rooms
        </Button>
        <h1 className="text-3xl font-bold mb-8">Edit Joined Room: {roomData.name}</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Room Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="form-select">Select Form</Label>
                  <Select value={selectedForm} onValueChange={handleFormChange}>
                    <SelectTrigger id="form-select">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.formName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Access Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Access End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="filled-form">Auto-filled Form</Label>
                  <Textarea
                    id="filled-form"
                    value={filledForm}
                    readOnly={true}
                    className="w-full mt-2 h-64"
                    placeholder="No form content available"
                  />
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delete Your Filled Form</h3>
                <p className="text-sm text-gray-500">
                  Warning: This action cannot be undone. It will permanently delete your filled form and associated data for this file room.
                </p>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" onClick={() => {
                      console.log("Delete button clicked");
                      setIsDeleteDialogOpen(true);
                    }}>
                      Delete My Filled Form
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your filled form
                        and remove your access to this file room. You will no longer be able to view or edit this form.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        console.log("Confirm delete clicked");
                        handleDeleteUserForm();
                        setIsDeleteDialogOpen(false);
                      }}>
                        Yes, delete my filled form
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

