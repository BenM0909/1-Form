'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";

const planLimits = {
  basic: 0,
  pro: 1,
  premium: 5,
  enterprise: Infinity
};

export default function AIUpload({ params }: { params: { id: string } }) {
  const { user, loading, userPlan } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<string>('');
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [editableForm, setEditableForm] = useState<string>('');
  const [usageCount, setUsageCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUsageCount();
    }
  }, [user]);

  const fetchUsageCount = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUsageCount(userSnap.data().aiFormUploads || 0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    if (usageCount >= planLimits[userPlan]) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached the FormAI Form Uploader usage limit for your ${userPlan} plan.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingSteps([]);
    try {
      setProcessingSteps(prev => [...prev, "Reading file contents..."]);
      const fileContent = await file.text();

      setProcessingSteps(prev => [...prev, "Initiating AI processing..."]);
      setProcessingSteps(prev => [...prev, "AI analyzing document structure..."]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      setProcessingSteps(prev => [...prev, "AI extracting form fields..."]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      setProcessingSteps(prev => [...prev, "AI generating form template..."]);
      const aiGeneratedForm = await processFileWithAI(fileContent);

      setGeneratedForm(aiGeneratedForm);
      setEditableForm(aiGeneratedForm);
      setProcessingSteps(prev => [...prev, "Form generated successfully! You can now edit it below."]);

      // Update usage count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        aiFormUploads: increment(1)
      });
      setUsageCount(prev => prev + 1);

    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingSteps(prev => [...prev, "Error occurred during processing."]);
      toast({
        title: "Error",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulated AI processing function
  const processFileWithAI = async (fileContent: string): Promise<string> => {
    // In a real implementation, this function would call your AI service
    // For now, we'll return a mock form structure based on the file content
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    return `
      Name: {{name}}
      Date of Birth: {{dateOfBirth}}
      Gender: {{gender}}
      Address: {{address}}
      Phone Number: {{phoneNumber}}
      Email: {{email}}
      Emergency Contact: {{emergencyContact}}
      Medical Conditions: {{medicalConditions}}
      Allergies: {{allergies}}
      Medications: {{medications}}
      Insurance Provider: {{insuranceProvider}}
      Insurance Policy Number: {{insurancePolicyNumber}}
    `;
  };

  const handleSaveForm = async () => {
    try {
      const roomRef = doc(db, 'fileRooms', params.id);
      await updateDoc(roomRef, {
        formContent: editableForm,
        updatedAt: new Date(),
      });
      toast({
        title: "Success",
        description: "Form saved successfully!",
      });
      router.push(`/file-rooms/${params.id}`);
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      });
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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">AI Form Generator</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload File for AI Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!file || isProcessing || usageCount >= planLimits[userPlan]}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
              >
                {isProcessing ? 'Processing...' : 'Generate Form'}
              </Button>
              <p className="text-sm text-gray-600">
                FormAI Form Uploader usage: {usageCount} / {planLimits[userPlan] === Infinity ? 'Unlimited' : planLimits[userPlan]}
              </p>
              {processingSteps.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <h3 className="font-semibold mb-2">Processing Steps:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {processingSteps.map((step, index) => (
                      <li key={index} className="text-sm">
                        {step}
                        {index === processingSteps.length - 1 && isProcessing && (
                          <span className="ml-2 animate-pulse">...</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isProcessing && (
                    <p className="mt-2 text-sm text-gray-600">
                      AI processing may take a few moments. We're analyzing your document, extracting relevant information, and generating a customized form structure.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {generatedForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generated Form (Editable)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editableForm}
                onChange={(e) => setEditableForm(e.target.value)}
                rows={15}
                className="w-full mb-4"
              />
              <div className="flex justify-between">
                <Button
                  onClick={() => router.push(`/file-rooms/${params.id}`)}
                  variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-100 transition-colors duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveForm}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
                >
                  Save Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

