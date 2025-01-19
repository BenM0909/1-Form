'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Layout from '../../../../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { decryptData } from '../../../../utils/encryption';

export default function FillForm({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [userResponses, setUserResponses] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchRoomAndFormData();
    }
  }, [user, router, params.id]);

  const fetchRoomAndFormData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roomDocRef = doc(db, 'fileRooms', params.id);
      const roomDocSnap = await getDoc(roomDocRef);
      if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        setRoomData(roomData);
        if (roomData.assignedFormId) {
          const formDocRef = doc(db, 'forms', roomData.assignedFormId);
          const formDocSnap = await getDoc(formDocRef);
          if (formDocSnap.exists()) {
            const encryptedData = formDocSnap.data().encryptedData;
            try {
              const decryptedData = decryptData(encryptedData);
              setFormData(decryptedData);
            } catch (decryptError) {
              console.error('Failed to decrypt form data:', decryptError);
              setError('Unable to decrypt form data. Please contact support.');
            }
          } else {
            setError('Assigned form not found');
          }
        } else {
          setError('No form assigned to this room');
        }
      } else {
        setError('File room not found');
      }
    } catch (error) {
      console.error('Error fetching room and form data:', error);
      setError('Failed to fetch form data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    setUserResponses({ ...userResponses, [fieldName]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData) return;

    try {
      const formResponse = {
        ...userResponses,
        submittedBy: user.uid,
        submittedAt: new Date().toISOString()
      };
      console.log('Submitting form response:', formResponse);
      await setDoc(doc(db, 'fileRooms', params.id, 'responses', user.uid), formResponse);
      console.log('Form submitted successfully');
      router.push(`/file-rooms/${params.id}/thank-you`);
    } catch (e) {
      console.error('Error submitting form:', e);
      setError('Failed to submit form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Loading Form...</h1>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Error</h1>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!formData) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">No Form Data</h1>
          <p>No form data is available for this room.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Fill Out Form</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {formData && (
          <Card>
            <CardHeader>
              <CardTitle>{formData.formName}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <Input
                    id="name"
                    value={userResponses.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={userResponses.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <Input
                    id="gender"
                    value={userResponses.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
                  <Textarea
                    id="allergies"
                    value={userResponses.allergies || ''}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Medical History</label>
                  <Textarea
                    id="medicalHistory"
                    value={userResponses.medicalHistory || ''}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700">Current Medications</label>
                  <Textarea
                    id="currentMedications"
                    value={userResponses.currentMedications || ''}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                  <Input
                    id="insuranceProvider"
                    value={userResponses.insuranceProvider || ''}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700">Insurance Policy Number</label>
                  <Input
                    id="insurancePolicyNumber"
                    value={userResponses.insurancePolicyNumber || ''}
                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="primaryPhysicianName" className="block text-sm font-medium text-gray-700">Primary Physician Name</label>
                  <Input
                    id="primaryPhysicianName"
                    value={userResponses.primaryPhysicianName || ''}
                    onChange={(e) => handleInputChange('primaryPhysicianName', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="primaryPhysicianPhone" className="block text-sm font-medium text-gray-700">Primary Physician Phone</label>
                  <Input
                    id="primaryPhysicianPhone"
                    value={userResponses.primaryPhysicianPhone || ''}
                    onChange={(e) => handleInputChange('primaryPhysicianPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
                  <Input
                    id="occupation"
                    value={userResponses.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="employer" className="block text-sm font-medium text-gray-700">Employer</label>
                  <Input
                    id="employer"
                    value={userResponses.employer || ''}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
                  <Input
                    id="bloodType"
                    value={userResponses.bloodType || ''}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organDonor"
                    checked={userResponses.organDonor || false}
                    onCheckedChange={(checked) => handleInputChange('organDonor', checked as boolean)}
                  />
                  <label htmlFor="organDonor" className="text-sm font-medium text-gray-700">Organ Donor</label>
                </div>
                {[0, 1, 2].map((index) => (
                  <div key={`emergencyContact${index}`} className="space-y-2">
                    <h3 className="text-lg font-semibold">Emergency Contact {index + 1}</h3>
                    <Input
                      placeholder="Name"
                      value={userResponses[`emergencyContact${index}Name`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}Name`, e.target.value)}
                    />
                    <Input
                      placeholder="Relationship"
                      value={userResponses[`emergencyContact${index}Relationship`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}Relationship`, e.target.value)}
                    />
                    <Input
                      placeholder="Home Phone"
                      value={userResponses[`emergencyContact${index}HomePhone`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}HomePhone`, e.target.value)}
                    />
                    <Input
                      placeholder="Work Phone"
                      value={userResponses[`emergencyContact${index}WorkPhone`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}WorkPhone`, e.target.value)}
                    />
                    <Input
                      placeholder="Cell Phone"
                      value={userResponses[`emergencyContact${index}CellPhone`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}CellPhone`, e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      value={userResponses[`emergencyContact${index}Email`] || ''}
                      onChange={(e) => handleInputChange(`emergencyContact${index}Email`, e.target.value)}
                    />
                  </div>
                ))}
                {[0, 1, 2].map((index) => (
                  <div key={`authorizedContact${index}`} className="space-y-2">
                    <h3 className="text-lg font-semibold">Authorized Contact {index + 1}</h3>
                    <Input
                      placeholder="Name"
                      value={userResponses[`authorizedContact${index}Name`] || ''}
                      onChange={(e) => handleInputChange(`authorizedContact${index}Name`, e.target.value)}
                    />
                    <Input
                      placeholder="Relationship"
                      value={userResponses[`authorizedContact${index}Relationship`] || ''}
                      onChange={(e) => handleInputChange(`authorizedContact${index}Relationship`, e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={userResponses[`authorizedContact${index}Phone`] || ''}
                      onChange={(e) => handleInputChange(`authorizedContact${index}Phone`, e.target.value)}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Primary Contact</h3>
                  <Input
                    placeholder="Name"
                    value={userResponses.primaryContactName || ''}
                    onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                  />
                  <Input
                    placeholder="Home Phone"
                    value={userResponses.primaryContactHomePhone || ''}
                    onChange={(e) => handleInputChange('primaryContactHomePhone', e.target.value)}
                  />
                  <Input
                    placeholder="Cell Phone"
                    value={userResponses.primaryContactCellPhone || ''}
                    onChange={(e) => handleInputChange('primaryContactCellPhone', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={userResponses.primaryContactEmail || ''}
                    onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                  />
                  <Input
                    placeholder="Address"
                    value={userResponses.primaryContactAddress || ''}
                    onChange={(e) => handleInputChange('primaryContactAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Secondary Contact</h3>
                  <Input
                    placeholder="Name"
                    value={userResponses.secondaryContactName || ''}
                    onChange={(e) => handleInputChange('secondaryContactName', e.target.value)}
                  />
                  <Input
                    placeholder="Home Phone"
                    value={userResponses.secondaryContactHomePhone || ''}
                    onChange={(e) => handleInputChange('secondaryContactHomePhone', e.target.value)}
                  />
                  <Input
                    placeholder="Cell Phone"
                    value={userResponses.secondaryContactCellPhone || ''}
                    onChange={(e) => handleInputChange('secondaryContactCellPhone', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={userResponses.secondaryContactEmail || ''}
                    onChange={(e) => handleInputChange('secondaryContactEmail', e.target.value)}
                  />
                  <Input
                    placeholder="Address"
                    value={userResponses.secondaryContactAddress || ''}
                    onChange={(e) => handleInputChange('secondaryContactAddress', e.target.value)}
                  />
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

