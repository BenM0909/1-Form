'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { db } from '../../../../lib/firebase';
import { collection, query, getDocs, doc, getDoc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Folder, File, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';

interface UserForm {
  id: string;
  userId: string;
  displayName: string;
  filledForm: string;
  selectedForm: string;
  startDate: string;
  endDate: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
}

export default function FilledForms({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filledForms, setFilledForms] = useState<UserForm[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMoveFormId, setCurrentMoveFormId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchFilledForms();
      fetchFolders();
    }
  }, [user, loading, params.id]);

  const fetchUserDisplayName = async (userId: string): Promise<string> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().displayName || 'Unknown User';
      }
      return 'Unknown User';
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return 'Unknown User';
    }
  };

  const fetchFilledForms = async () => {
    try {
      const q = query(collection(db, 'fileRooms', params.id, 'userAccess'));
      const querySnapshot = await getDocs(q);
      const now = new Date();

      const formsPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = data.userId || doc.id.split('_')[0]; // Extract userId from the document ID
        const displayName = await fetchUserDisplayName(userId);
        const endDate = new Date(data.endDate);
        
        if (endDate < now) {
          // Delete expired form
          await deleteDoc(doc.ref);
          return null;
        }
        
        return {
          id: doc.id,
          userId,
          displayName,
          filledForm: data.filledForm || '',
          selectedForm: data.selectedForm || '',
          startDate: data.startDate || 'Not set',
          endDate: data.endDate || 'Not set',
          folderId: data.folderId || null,
        };
      });

      const forms = (await Promise.all(formsPromises)).filter(form => form !== null) as UserForm[];
      setFilledForms(forms);
    } catch (error) {
      console.error("Error fetching filled forms:", error);
      setError("Failed to fetch filled forms. Please try again later.");
    }
  };

  const fetchFolders = async () => {
    try {
      const foldersRef = collection(db, 'fileRooms', params.id, 'folders');
      const querySnapshot = await getDocs(foldersRef);
      const fetchedFolders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setFolders(fetchedFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setError("Failed to fetch folders. Please try again later.");
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      const folderRef = doc(collection(db, 'fileRooms', params.id, 'folders'));
      await setDoc(folderRef, { name: newFolderName });
      setNewFolderName('');
      fetchFolders();
      toast({
        title: "Success",
        description: "Folder created successfully.",
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renameFolder = async () => {
    if (!renameValue.trim() || !renameFolderId) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      const folderRef = doc(db, 'fileRooms', params.id, 'folders', renameFolderId);
      await updateDoc(folderRef, { name: renameValue });
      setRenameFolderId(null);
      setRenameValue('');
      fetchFolders();
      toast({
        title: "Success",
        description: "Folder renamed successfully.",
      });
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast({
        title: "Error",
        description: "Failed to rename folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await deleteDoc(doc(db, 'fileRooms', params.id, 'folders', folderId));
      // Update forms in this folder to have no folder
      const formsToUpdate = filledForms.filter(form => form.folderId === folderId);
      for (const form of formsToUpdate) {
        const formRef = doc(db, 'fileRooms', params.id, 'userAccess', form.id);
        await updateDoc(formRef, { folderId: null });
      }
      fetchFolders();
      fetchFilledForms();
      toast({
        title: "Success",
        description: "Folder deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const moveFormToFolder = async (formId: string, folderId: string | null) => {
    try {
      const formRef = doc(db, 'fileRooms', params.id, 'userAccess', formId);
      await updateDoc(formRef, { folderId });
      
      // Update local state
      setFilledForms(prevForms => 
        prevForms.map(form => 
          form.id === formId ? { ...form, folderId } : form
        )
      );
      
      toast({
        title: "Success",
        description: "Form moved successfully.",
      });
      setCurrentMoveFormId(null);
    } catch (error) {
      console.error("Error moving form:", error);
      toast({
        title: "Error",
        description: "Failed to move form. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Close the dialog
      setIsDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Not set') return dateString;
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
        
        {/* Folder management */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <Input
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mr-2"
              />
              <Button onClick={createFolder}>Create Folder</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card
                className={`cursor-pointer ${currentFolder === null ? 'bg-blue-100' : ''}`}
                onClick={() => setCurrentFolder(null)}
              >
                <CardContent className="flex items-center p-4">
                  <Folder className="mr-2" />
                  <span>All Forms</span>
                </CardContent>
              </Card>
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`cursor-pointer ${currentFolder === folder.id ? 'bg-blue-100' : ''}`}
                  
                >
                  <CardContent 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <div className="flex items-center">
                      <Folder className="mr-2" />
                      <span>{folder.name}</span>
                    </div>
                    <div>
                      {currentFolder === folder.id && (
                        <span className="text-blue-500 font-bold">Selected</span>
                      )}
                    </div>
                  </CardContent>
                  
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filled Forms */}
        {currentFolder !== null && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentFolder(null)} 
            className="mb-4"
          >
            Back to All Folders
          </Button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filledForms
            .filter(form => currentFolder === null || form.folderId === currentFolder)
            .map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>{form.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">Access Period:</span>
                    <div className="mt-1">
                      <div>Start: {formatDate(form.startDate)}</div>
                      <div>End: {formatDate(form.endDate)}</div>
                    </div>
                  </div>
                  {form.folderId && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Current Folder:</span>
                      <div className="mt-1">{folders.find(folder => folder.id === form.folderId)?.name || 'Unknown Folder'}</div>
                    </div>
                  )}
                  {new Date(form.endDate) >= new Date() ? (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => router.push(`/file-rooms/${params.id}/forms/${form.id}/view`)}
                    >
                      View Filled Form
                    </Button>
                  ) : (
                    <p className="text-red-500 mt-2">Access period has expired. Form content is no longer available.</p>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2" 
                        onClick={() => {
                          setCurrentMoveFormId(form.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        Move to Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Move to Folder</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => currentMoveFormId && moveFormToFolder(currentMoveFormId, null)}>No Folder</Button>
                        {folders.map((folder) => (
                          <Button key={folder.id} onClick={() => currentMoveFormId && moveFormToFolder(currentMoveFormId, folder.id)}>
                            {folder.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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

