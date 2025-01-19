import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { encryptData, isEncrypted, isLegacyData } from '../utils/encryption';

async function migrateFormData() {
  const formsRef = collection(db, 'forms');
  const snapshot = await getDocs(formsRef);

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    
    if (!isEncrypted(data.encryptedData)) {
      let formData;
      if (isLegacyData(data.encryptedData)) {
        formData = JSON.parse(data.encryptedData);
      } else {
        formData = data.encryptedData;
      }

      const encryptedData = encryptData(formData);
      await updateDoc(doc(db, 'forms', docSnapshot.id), { encryptedData });
      console.log(`Migrated and encrypted form: ${docSnapshot.id}`);
    } else {
      console.log(`Form already encrypted: ${docSnapshot.id}`);
    }
  }

  console.log('Migration complete');
}

migrateFormData().catch(console.error);

