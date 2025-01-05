import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, setDoc, doc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { encryptData, decryptData } from '../utils/encryption';

interface Form {
  id: string;
  formName: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  primaryPhysician: { name: string; phone: string };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    homePhone: string;
    workPhone: string;
    cellPhone: string;
    email: string;
  }>;
  authorizedContacts: Array<{ name: string; relationship: string; phone: string }>;
  primaryContact: { name: string; homePhone: string; cellPhone: string; email: string; address: string };
  secondaryContact: { name: string; homePhone: string; cellPhone: string; email: string; address: string };
  occupation: string;
  employer: string;
  bloodType: string;
  organDonor: boolean;
}

export function useForms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchForms = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        setForms([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'forms'), where('userId', '==', user.uid));
        unsubscribe = onSnapshot(
          q,
          (querySnapshot: QuerySnapshot<DocumentData>) => {
            const formsList: Form[] = [];
            querySnapshot.forEach((doc) => {
              const encryptedData = doc.data().encryptedData;
              const decryptedData = decryptData(encryptedData);
              if (decryptedData) {
                formsList.push({ id: doc.id, ...decryptedData } as Form);
              } else {
                console.error(`Failed to decrypt form data for document ${doc.id}`);
              }
            });
            setForms(formsList);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching forms: ", error);
            setError("Failed to fetch forms. Please try again later.");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up forms listener: ", error);
        setError("Failed to set up forms listener. Please try again later.");
        setLoading(false);
      }
    };

    fetchForms();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addForm = async (formData: Omit<Form, 'id'>) => {
    if (!user) {
      console.error("No user logged in");
      throw new Error("You must be logged in to add a form.");
    }
    try {
      const encryptedData = encryptData(formData);
      await addDoc(collection(db, 'forms'), { 
        userId: user.uid,
        encryptedData
      });
    } catch (error) {
      console.error("Error adding form: ", error);
      throw error;
    }
  };

  const updateForm = async (id: string, formData: Partial<Form>) => {
    if (!user) {
      console.error("No user logged in");
      throw new Error("You must be logged in to update a form.");
    }
    try {
      const encryptedData = encryptData(formData);
      await setDoc(doc(db, 'forms', id), { userId: user.uid, encryptedData }, { merge: true });
    } catch (error) {
      console.error("Error updating form: ", error);
      throw error;
    }
  };

  const deleteForm = async (id: string) => {
    if (!user) {
      console.error("No user logged in");
      throw new Error("You must be logged in to delete a form.");
    }
    try {
      await deleteDoc(doc(db, 'forms', id));
    } catch (error) {
      console.error("Error deleting form: ", error);
      throw error;
    }
  };

  return { forms, loading, error, addForm, updateForm, deleteForm };
}

