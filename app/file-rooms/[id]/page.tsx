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
import { doc, getDoc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { decryptData, isEncrypted, encryptData } from '../../../utils/encryption';

const planUserLimits = {
  basic: 0,
  pro: 250,
  premium: 750,
  enterprise: Infinity
};

export default function FileRoom({ params }: { params: { id: string } }) {
  const { user, loading, userPlan } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>({
    name: '',
    recommendedStartDate: '',
    recommendedEndDate: '',
  });
  const [formContent, setFormContent] = useState<string | null>(null);
  const [filledForms, setFilledForms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>('');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [deleteAfterAccess, setDeleteAfterAccess] = useState<boolean>(false);
  const [editableStartDate, setEditableStartDate] = useState('');
  const [editableEndDate, setEditableEndDate] = useState('');
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchRoomData();
      }
    }
  }, [user, loading, router, params.id]);

  useEffect(() => {
    if (roomData) {
      setEditableStartDate(roomData.recommendedStartDate || '');
      setEditableEndDate(roomData.recommendedEndDate || '');
    }
  }, [roomData]);

  const fetchRoomData = async () => {
    if (!user) return;
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
        setFormContent(roomSnap.data().formContent || null);
        setInviteLink(`${window.location.origin}/join-room/${params.id}`);
        setDeleteAfterAccess(data.deleteAfterAccess || false);
        setEditableStartDate(data.recommendedStartDate || '');
        setEditableEndDate(data.recommendedEndDate || '');

        // Fetch filled forms from userAccess subcollection
        const userAccessRef = collection(db, 'fileRooms', params.id, 'userAccess');
        const userAccessSnapshot = await getDocs(userAccessRef);
        const forms = userAccessSnapshot.docs.map(doc => {
          const encryptedData = doc.data().encryptedData;
          let formData;
          if (isEncrypted(encryptedData)) {
            formData = decryptData(encryptedData);
          } else {
            console.warn(`Form ${doc.id} is not encrypted. Consider re-encrypting.`);
            formData = doc.data();
          }
          return { id: doc.id, ...formData };
        });
        setFilledForms(forms);

        // Check if the number of users exceeds the plan limit
        if (forms.length >= planUserLimits[userPlan]) {
          setError(`You have reached the maximum number of users for your ${userPlan} plan.`);
        }
      } else {
        setError('File room not found');
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError("Failed to fetch room data. Please try again later.");
    }
  };

  const handleDeleteRoom = async () => {
    if (!user) return;
    try {
      // Delete the main file room document
      await deleteDoc(doc(db, 'fileRooms', params.id));
      
      // Delete all user access documents in the subcollection
      const userAccessRef = collection(db, 'fileRooms', params.id, 'userAccess');
      const userAccessSnapshot = await getDocs(userAccessRef);
      
      const deletePromises = userAccessSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      toast({
        title: "Success",
        description: "File room and all associated data deleted successfully.",
        variant: "default",
      });
      router.push('/file-rooms');
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to delete file room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAfterAccessChange = async (checked: boolean) => {
    setDeleteAfterAccess(checked);
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const encryptedData = roomSnap.data().encryptedData;
        let data = isEncrypted(encryptedData) ? decryptData(encryptedData) : roomSnap.data();
        data = { ...data, deleteAfterAccess: checked };
        const newEncryptedData = encryptData(data);
        await updateDoc(roomRef, { encryptedData: newEncryptedData });
        toast({
          title: "Success",
          description: "Room settings updated successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error updating room settings:", error);
      toast({
        title: "Error",
        description: "Failed to update room settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecommendedDates = async () => {
    setIsUpdatingDates(true);
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const encryptedData = roomSnap.data().encryptedData;
        let data = isEncrypted(encryptedData) ? decryptData(encryptedData) : roomSnap.data();
        data = {
          ...data,
          recommendedStartDate: editableStartDate,
          recommendedEndDate: editableEndDate,
        };
        const newEncryptedData = encryptData(data);
        await updateDoc(roomRef, { encryptedData: newEncryptedData });
        toast({
          title: "Success",
          description: "Recommended dates updated successfully.",
          variant: "default",
        });
        // Update local state
        setRoomData(data);
      }
    } catch (error) {
      console.error("Error updating recommended dates:", error);
      toast({
        title: "Error",
        description: "Failed to update recommended dates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingDates(false);
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
        <h1 className="text-3xl font-bold mb-8">Edit File Room: {roomData?.name}</h1>
        <div className="flex space-x-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/file-rooms')}>
            Back to File Rooms
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
            onClick={() => router.push(`/file-rooms/${params.id}/forms`)}
          >
            View All Filled Forms
          </Button>
        </div>
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
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={async () => {
                setIsCopyingLink(true);
                try {
                  await navigator.clipboard.writeText(inviteLink);
                  toast({
                    title: "Success",
                    description: "Invite link copied to clipboard.",
                    variant: "default",
                  });
                } catch (error) {
                  console.error("Error copying link:", error);
                  toast({
                    title: "Error",
                    description: "Failed to copy link. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsCopyingLink(false);
                }
              }}
              disabled={isCopyingLink}
            >
              {isCopyingLink ? 'Copying...' : 'Copy Link'}
            </Button>
          </CardContent>
        </Card>

        {/* Recommended Dates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Access Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recommendedStartDate">Start Date</Label>
                <Input
                  id="recommendedStartDate"
                  type="date"
                  value={editableStartDate}
                  onChange={(e) => setEditableStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recommendedEndDate">End Date</Label>
                <Input
                  id="recommendedEndDate"
                  type="date"
                  value={editableEndDate}
                  onChange={(e) => setEditableEndDate(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleUpdateRecommendedDates} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
                disabled={isUpdatingDates}
              >
                {isUpdatingDates ? 'Updating...' : 'Update Recommended Dates'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Room Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-after-access"
                checked={deleteAfterAccess}
                onCheckedChange={handleDeleteAfterAccessChange}
              />
              <Label htmlFor="delete-after-access">
                Delete filled forms after access date
              </Label>
            </div>
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">Edit Form</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-gray-600">
                  No form assigned. Create a new form for this file room.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300" onClick={() => router.push(`/file-rooms/${params.id}/create`)}>
                  Create Form
                </Button>
              </div>
            )}
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
              onClick={() => router.push(`/file-rooms/${params.id}/ai-upload`)}
            >
              AI Upload
            </Button>
          </CardContent>
        </Card>

        {/* Filled Forms Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filled Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
              onClick={() => router.push(`/file-rooms/${params.id}/forms`)}
            >
              View All Filled Forms ({filledForms.length})
            </Button>
          </CardContent>
        </Card>

        {/* Delete Room Button */}
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300" 
              onClick={() => setIsAlertDialogOpen(true)}
            >
              Delete File Room
            </Button>
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
              <AlertDialogAction onClick={() => {
                handleDeleteRoom();
                setIsAlertDialogOpen(false);
              }}>
                Yes, delete file room
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

