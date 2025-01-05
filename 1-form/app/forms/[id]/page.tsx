'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout';
import { useForms } from '../../../hooks/useForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';

export default function EditForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { forms, updateForm, deleteForm } = useForms();
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const form = forms.find((f) => f.id === params.id);
    if (form) {
      setFormData(form);
    } else {
      setError('Form not found');
    }
  }, [forms, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (!formData) {
        throw new Error('No form data to update');
      }
      await updateForm(params.id, formData);
      router.push('/forms');
    } catch (err) {
      console.error('Error updating form:', err);
      setError('Failed to update form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const [section, field] = name.split('.');

    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (field) {
      setFormData((prevData) => ({
        ...prevData,
        [section]: {
          ...prevData[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleArrayChange = (index: number, arrayName: string, field: string, value: string) => {
    setFormData((prevData) => {
      const newArray = [...prevData[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prevData, [arrayName]: newArray };
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteForm(params.id);
        router.push('/forms');
      } catch (err) {
        setError('Failed to delete form. Please try again.');
      }
    }
  };

  if (!formData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Form</h1>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Form</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Form: {formData.formName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="formName">Form Name</Label>
                  <Input id="formName" name="formName" value={formData.formName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" name="gender" value={formData.gender} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea id="medicalHistory" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea id="currentMedications" name="currentMedications" value={formData.currentMedications} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input id="insuranceProvider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                  <Input id="insurancePolicyNumber" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="primaryPhysician.name">Primary Physician Name</Label>
                  <Input id="primaryPhysician.name" name="primaryPhysician.name" value={formData.primaryPhysician.name} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="primaryPhysician.phone">Primary Physician Phone</Label>
                  <Input id="primaryPhysician.phone" name="primaryPhysician.phone" value={formData.primaryPhysician.phone} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="employer">Employer</Label>
                  <Input id="employer" name="employer" value={formData.employer} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input id="bloodType" name="bloodType" value={formData.bloodType} onChange={handleChange} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organDonor"
                    checked={formData.organDonor}
                    onCheckedChange={(checked) => setFormData((prevData) => ({ ...prevData, organDonor: checked as boolean }))}
                  />
                  <Label htmlFor="organDonor">Organ Donor</Label>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Emergency Contacts</h3>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="space-y-2 mb-4 p-4 border rounded">
                    <Label htmlFor={`emergencyContacts[${index}].name`}>Name</Label>
                    <Input
                      id={`emergencyContacts[${index}].name`}
                      name={`emergencyContacts[${index}].name`}
                      value={contact.name}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'name', e.target.value)}
                    />
                    <Label htmlFor={`emergencyContacts[${index}].relationship`}>Relationship</Label>
                    <Input
                      id={`emergencyContacts[${index}].relationship`}
                      name={`emergencyContacts[${index}].relationship`}
                      value={contact.relationship}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'relationship', e.target.value)}
                    />
                    <Label htmlFor={`emergencyContacts[${index}].homePhone`}>Home Phone</Label>
                    <Input
                      id={`emergencyContacts[${index}].homePhone`}
                      name={`emergencyContacts[${index}].homePhone`}
                      value={contact.homePhone}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'homePhone', e.target.value)}
                    />
                    <Label htmlFor={`emergencyContacts[${index}].workPhone`}>Work Phone</Label>
                    <Input
                      id={`emergencyContacts[${index}].workPhone`}
                      name={`emergencyContacts[${index}].workPhone`}
                      value={contact.workPhone}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'workPhone', e.target.value)}
                    />
                    <Label htmlFor={`emergencyContacts[${index}].cellPhone`}>Cell Phone</Label>
                    <Input
                      id={`emergencyContacts[${index}].cellPhone`}
                      name={`emergencyContacts[${index}].cellPhone`}
                      value={contact.cellPhone}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'cellPhone', e.target.value)}
                    />
                    <Label htmlFor={`emergencyContacts[${index}].email`}>Email</Label>
                    <Input
                      id={`emergencyContacts[${index}].email`}
                      name={`emergencyContacts[${index}].email`}
                      value={contact.email}
                      onChange={(e) => handleArrayChange(index, 'emergencyContacts', 'email', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Authorized Contacts</h3>
                {formData.authorizedContacts.map((contact, index) => (
                  <div key={index} className="space-y-2 mb-4 p-4 border rounded">
                    <Label htmlFor={`authorizedContacts[${index}].name`}>Name</Label>
                    <Input
                      id={`authorizedContacts[${index}].name`}
                      name={`authorizedContacts[${index}].name`}
                      value={contact.name}
                      onChange={(e) => handleArrayChange(index, 'authorizedContacts', 'name', e.target.value)}
                    />
                    <Label htmlFor={`authorizedContacts[${index}].relationship`}>Relationship</Label>
                    <Input
                      id={`authorizedContacts[${index}].relationship`}
                      name={`authorizedContacts[${index}].relationship`}
                      value={contact.relationship}
                      onChange={(e) => handleArrayChange(index, 'authorizedContacts', 'relationship', e.target.value)}
                    />
                    <Label htmlFor={`authorizedContacts[${index}].phone`}>Phone</Label>
                    <Input
                      id={`authorizedContacts[${index}].phone`}
                      name={`authorizedContacts[${index}].phone`}
                      value={contact.phone}
                      onChange={(e) => handleArrayChange(index, 'authorizedContacts', 'phone', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Primary Contact</h3>
                <div className="space-y-2">
                  <Label htmlFor="primaryContact.name">Name</Label>
                  <Input id="primaryContact.name" name="primaryContact.name" value={formData.primaryContact.name} onChange={handleChange} />
                  <Label htmlFor="primaryContact.homePhone">Home Phone</Label>
                  <Input id="primaryContact.homePhone" name="primaryContact.homePhone" value={formData.primaryContact.homePhone} onChange={handleChange} />
                  <Label htmlFor="primaryContact.cellPhone">Cell Phone</Label>
                  <Input id="primaryContact.cellPhone" name="primaryContact.cellPhone" value={formData.primaryContact.cellPhone} onChange={handleChange} />
                  <Label htmlFor="primaryContact.email">Email</Label>
                  <Input id="primaryContact.email" name="primaryContact.email" value={formData.primaryContact.email} onChange={handleChange} />
                  <Label htmlFor="primaryContact.address">Address</Label>
                  <Input id="primaryContact.address" name="primaryContact.address" value={formData.primaryContact.address} onChange={handleChange} />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Secondary Contact</h3>
                <div className="space-y-2">
                  <Label htmlFor="secondaryContact.name">Name</Label>
                  <Input id="secondaryContact.name" name="secondaryContact.name" value={formData.secondaryContact.name} onChange={handleChange} />
                  <Label htmlFor="secondaryContact.homePhone">Home Phone</Label>
                  <Input id="secondaryContact.homePhone" name="secondaryContact.homePhone" value={formData.secondaryContact.homePhone} onChange={handleChange} />
                  <Label htmlFor="secondaryContact.cellPhone">Cell Phone</Label>
                  <Input id="secondaryContact.cellPhone" name="secondaryContact.cellPhone" value={formData.secondaryContact.cellPhone} onChange={handleChange} />
                  <Label htmlFor="secondaryContact.email">Email</Label>
                  <Input id="secondaryContact.email" name="secondaryContact.email" value={formData.secondaryContact.email} onChange={handleChange} />
                  <Label htmlFor="secondaryContact.address">Address</Label>
                  <Input id="secondaryContact.address" name="secondaryContact.address" value={formData.secondaryContact.address} onChange={handleChange} />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/forms')}>Cancel</Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>Delete Form</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}

