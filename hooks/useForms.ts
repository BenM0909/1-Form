import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, setDoc, doc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { encryptData, decryptData, isEncrypted } from '../utils/encryption';

interface Form {
  id: string;
  formName: string;
  // ... (other form fields)
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
              try {
                const data = doc.data();
                let formData: any;

                if (isEncrypted(data.encryptedData)) {
                  formData = decryptData(data.encryptedData);
                } else {
                  console.warn(`Form ${doc.id} is not encrypted. Consider re-encrypting.`);
                  formData = data;
                }

                formsList.push({ id: doc.id, ...formData } as Form);
              } catch (error) {
                console.error(`Failed to process form data for document ${doc.id}:`, error);
                formsList.push({ 
                  id: doc.id, 
                  formName: `Error: Unable to decrypt (${doc.id})`,
                  decryptionError: true
                } as unknown as Form);
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
      const docRef = await addDoc(collection(db, 'forms'), { 
        userId: user.uid,
        encryptedData
      });
      return docRef.id;
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

