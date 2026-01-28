import { db } from "./firebase";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, Timestamp, DocumentData } from "firebase/firestore";

export interface CustomQuestion {
  question: string;
  required: boolean;
}

// Public data structure (what students see in job listings)
export interface PublicBusinessData {
  companyName: string;
  location: string;
  industry: string;
  contactPersonName: string;
  email: string;
  preferredContactMethod: "Email" | "Phone";
  businessId: string;
  potentialProblems: string;
  customQuestions?: CustomQuestion[];
}

// Private data structure (only business owner sees)
interface PrivateBusinessData {
  userId: string;
  phone: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

// Full business data (used internally and for business owner)
export interface BusinessData extends PublicBusinessData {
  userId: string;
  phone: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export const saveBusinessData = async (businessData: BusinessData): Promise<void> => {
  try {
    const { userId, phone, createdAt, updatedAt, ...publicData } = businessData;
    
    // Save public data (visible to all authenticated users)
    await setDoc(doc(db, "businesses", userId), publicData);
    
    // Save private data in subcollection (only visible to owner)
    await setDoc(doc(db, "businesses", userId, "private", "details"), {
      userId,
      phone,
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
    });
  } catch (error) {
    console.error("Error saving business data:", error);
    throw error;
  }
};

export const getBusinessData = async (userId: string): Promise<BusinessData | null> => {
  try {
    const docRef = doc(db, "businesses", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const publicData = docSnap.data() as PublicBusinessData;
      
      // Get private data
      const privateDocRef = doc(db, "businesses", userId, "private", "details");
      const privateDocSnap = await getDoc(privateDocRef);
      const privateData = privateDocSnap.exists() ? privateDocSnap.data() as PrivateBusinessData : {
        userId,
        phone: "",
        createdAt: new Date(),
      };
      
      return {
        ...publicData,
        ...privateData,
      } as BusinessData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching business data:", error);
    throw error;
  }
};

export const updateBusinessData = async (userId: string, businessData: Partial<BusinessData>): Promise<void> => {
  try {
    const { phone, createdAt, updatedAt, ...publicData } = businessData;
    
    // Update public data
    if (Object.keys(publicData).length > 0) {
      await setDoc(doc(db, "businesses", userId), publicData, { merge: true });
    }
    
    // Update private data
    const privateUpdates: any = { updatedAt: new Date() };
    if (phone !== undefined) privateUpdates.phone = phone;
    if (createdAt !== undefined) privateUpdates.createdAt = createdAt;
    
    await setDoc(doc(db, "businesses", userId, "private", "details"), privateUpdates, { merge: true });
  } catch (error) {
    console.error("Error updating business data:", error);
    throw error;
  }
};

export interface Application {
  id?: string;
  studentId: string;
  studentName?: string;
  studentEmail: string;
  businessId: string;
  businessName: string;
  answers: { [questionId: string]: string };
  appliedAt: Date | any;
}

// This returns only public data (safe for all authenticated users to see)
export const getAllBusinesses = async (): Promise<PublicBusinessData[]> => {
  try {
    const businessesRef = collection(db, "businesses");
    const querySnapshot = await getDocs(businessesRef);
    const businesses: PublicBusinessData[] = [];
    
    querySnapshot.forEach((doc) => {
      businesses.push(doc.data() as PublicBusinessData);
    });
    
    // Note: We can't sort by createdAt here since it's in private data
    // If you need sorting, you'll need to add a publicCreatedAt field to public data
    
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
};

export const saveApplication = async (application: Omit<Application, "id">): Promise<string> => {
  try {
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, {
      ...application,
      appliedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving application:", error);
    throw error;
  }
};
