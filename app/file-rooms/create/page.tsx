'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from '../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { encryptData } from '../../../utils/encryption';

const planLimits = {
  basic: 0,
  pro: 2,
  premium: 10,
  enterprise: Infinity
};

export default function CreateFileRoom() {
  const { user, loading, userPlan } = useAuth();
  const router = useRouter();
  const [newRoomName, setNewRoomName] = useState('');
  const [deleteAfterAccess, setDeleteAfterAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedStartDate, setRecommendedStartDate] = useState('');
  const [recommendedEndDate, setRecommendedEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createFileRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      const roomData = {
        name: newRoomName,
        organizerId: user.uid,
        createdAt: new Date(),
        deleteAfterAccess: deleteAfterAccess,
        recommendedStartDate: recommendedStartDate,
        recommendedEndDate: recommendedEndDate,
      };
      const encryptedData = encryptData(roomData);
      const docRef = await addDoc(collection(db, 'fileRooms'), {
        encryptedData,
        organizerId: user.uid, // Keep this unencrypted for querying
      });
      toast({
        title: "Success",
        description: "File room created successfully. You can now find it in your list of file rooms.",
        variant: "default",
      });
      router.push(`/file-rooms/${docRef.id}`);
    } catch (error) {
      console.error("Error creating file room:", error);
      toast({
        title: "Error",
        description: "Failed to create file room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
    router.push('/login');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Create New File Room</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New File Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createFileRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recommended-start-date">Recommended Start Date</Label>
                  <Input
                    id="recommended-start-date"
                    type="date"
                    value={recommendedStartDate}
                    onChange={(e) => setRecommendedStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="recommended-end-date">Recommended End Date</Label>
                  <Input
                    id="recommended-end-date"
                    type="date"
                    value={recommendedEndDate}
                    onChange={(e) => setRecommendedEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-after-access"
                  checked={deleteAfterAccess}
                  onCheckedChange={(checked) => setDeleteAfterAccess(checked as boolean)}
                />
                <Label htmlFor="delete-after-access">
                  Delete filled forms after access date
                </Label>
              </div>
              <Button 
                type="button" 
                onClick={() => router.push('/file-rooms')}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-300 mt-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

