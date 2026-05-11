import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface Patient {
  id?: string;
  fullName: string;
  birthDate: string;
  gender: string;
  documentId: string;
  photoUrl?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  companionName?: string;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ClinicalRecord {
  id?: string;
  patientId: string;
  type: 'anamnesis' | 'evolution' | 'prescription' | 'discharge';
  data: any;
  professionalName: string;
  createdBy: string;
  createdAt?: any;
}

export interface Medication {
  id?: string;
  name: string;
  category: 'Antibiótico' | 'Anti-inflamatório' | 'Corticóide' | 'Opioide' | 'Anestésico' | 'Outros';
  defaultQuantity: string;
  defaultPosology: string;
  createdBy: string;
  createdAt?: any;
}

const PATIENTS_COLLECTION = 'patients';
const MEDICATIONS_COLLECTION = 'medications';

export const dataService = {
  // CREATE or UPDATE Patient
  async savePatient(patientData: Partial<Patient> & { createdBy: string }) {
    const path = PATIENTS_COLLECTION;
    try {
      if (patientData.id) {
        const { id, ...data } = patientData;
        const docRef = doc(db, path, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        return id;
      } else {
        const docRef = await addDoc(collection(db, path), {
          ...patientData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // GET Patient by Document ID (CPF/CNS)
  async findPatientByDocument(documentId: string) {
    const path = PATIENTS_COLLECTION;
    try {
      const q = query(collection(db, path), where('documentId', '==', documentId), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Patient;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // GET Patient by Firestore ID
  async getPatientById(id: string) {
    const path = `${PATIENTS_COLLECTION}/${id}`;
    try {
      const docSnap = await getDoc(doc(db, PATIENTS_COLLECTION, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Patient;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // SEARCH Patients by Name or BirthDate or Document
  async searchPatients({ name, birthDate, documentId }: { name?: string, birthDate?: string, documentId?: string }) {
    const path = PATIENTS_COLLECTION;
    try {
      let q = query(collection(db, path), limit(50));
      
      if (documentId) {
        q = query(collection(db, path), where('documentId', '==', documentId), limit(1));
      } else if (name) {
        // Simple prefix search
        q = query(
          collection(db, path), 
          where('fullName', '>=', name.toUpperCase()), 
          where('fullName', '<=', name.toUpperCase() + '\uf8ff'),
          limit(20)
        );
      } else if (birthDate) {
        q = query(collection(db, path), where('birthDate', '==', birthDate), limit(20));
      }

      console.log('Fetching patients with query:', q);
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      console.log('Found patients:', results.length);
      return results;
    } catch (error) {
      console.error('Error in searchPatients:', error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // USER MANAGEMENT
  async getUserProfile(userId: string) {
    const path = `app_users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'app_users', userId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async registerUser(userId: string, data: { email: string, displayName: string, role: string }) {
    const isAdmin = data.email === 'romulochaves77@gmail.com';
    const path = `app_users/${userId}`;
    try {
      await setDoc(doc(db, 'app_users', userId), {
        ...data,
        status: isAdmin ? 'active' : 'pending',
        role: isAdmin ? 'admin' : data.role,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAllUsers() {
    const path = 'app_users';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'revoked', role?: string) {
    const path = `app_users/${userId}`;
    try {
      const data: any = { status };
      if (role) data.role = role;
      await updateDoc(doc(db, 'app_users', userId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // SAVE Clinical Record
  async saveClinicalRecord(record: Omit<ClinicalRecord, 'id' | 'createdAt'>) {
    const path = `patients/${record.patientId}/clinical_records`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...record,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // GET Clinical Records for Patient
  // --- Templates Management ---
  async saveTemplate(template: { title: string, content: string, category: 'reason' | 'evolution' | 'prescription', userId: string }) {
    const path = 'templates';
    try {
      if ((template as any).id) {
        const { id, ...rest } = template as any;
        await setDoc(doc(db, path, id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
        return id;
      } else {
        const docRef = await addDoc(collection(db, path), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getTemplates(userId: string, category?: string) {
    const path = 'templates';
    try {
      let q = query(collection(db, path), where('userId', '==', userId));
      if (category) {
        q = query(q, where('category', '==', category));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async deleteTemplate(templateId: string) {
    const path = `templates/${templateId}`;
    try {
      await deleteDoc(doc(db, 'templates', templateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async getRecordsByPatient(patientId: string) {
    const path = `patients/${patientId}/clinical_records`;
    try {
      const q = query(collection(db, 'patients', patientId, 'clinical_records'));
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Ensure createdAt is handleable
          _createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0)
        } as ClinicalRecord & { _createdAt: number };
      });
      console.log(`Loaded ${records.length} records for patient ${patientId}`);
      // Sort manually to avoid index requirement for now
      return records.sort((a, b) => b._createdAt - a._createdAt);
    } catch (error) {
      console.error('Error fetching clinical records:', error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async deletePatient(patientId: string) {
    const path = `patients/${patientId}`;
    try {
      await deleteDoc(doc(db, 'patients', patientId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteClinicalRecord(patientId: string, recordId: string) {
    const path = `patients/${patientId}/clinical_records/${recordId}`;
    try {
      await deleteDoc(doc(db, 'patients', patientId, 'clinical_records', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Medication Management ---
  async saveMedication(medication: Omit<Medication, 'id' | 'createdAt'> & { id?: string }) {
    const path = MEDICATIONS_COLLECTION;
    try {
      if (medication.id) {
        const { id, ...data } = medication;
        await updateDoc(doc(db, path, id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        return id;
      } else {
        const docRef = await addDoc(collection(db, path), {
          ...medication,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getMedications(category?: string) {
    const path = MEDICATIONS_COLLECTION;
    try {
      let q = query(collection(db, path), orderBy('name', 'asc'));
      if (category) {
        q = query(collection(db, path), where('category', '==', category), orderBy('name', 'asc'));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async deleteMedication(medicationId: string) {
    const path = `${MEDICATIONS_COLLECTION}/${medicationId}`;
    try {
      await deleteDoc(doc(db, MEDICATIONS_COLLECTION, medicationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
