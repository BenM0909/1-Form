import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  userPlan: string;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('basic');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user plan from Firestore
        const userDoc = await getDoc(doc(getFirestore(), 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserPlan(userDoc.data().plan || 'basic');
        } else {
          setUserPlan('basic');
        }
      } else {
        setUserPlan('basic');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, userPlan };
}

