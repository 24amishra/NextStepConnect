import { db } from "./firebase";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, Timestamp, DocumentData, updateDoc, increment, deleteDoc } from "firebase/firestore";

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
  categories?: string[]; // Array of category tags
}

// Private data structure (only business owner sees)
interface PrivateBusinessData {
  userId: string;
  phone: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
  approvalStatus?: "pending" | "approved" | "rejected";
}

// Full business data (used internally and for business owner)
export interface BusinessData extends PublicBusinessData {
  userId: string;
  phone: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export const saveBusinessData = async (businessData: BusinessData): Promise<void> => {
  try {
    const { userId, phone, createdAt, updatedAt, approvalStatus, ...publicData } = businessData;

    // Ensure businessId is set to userId
    const publicDataWithId = {
      ...publicData,
      businessId: userId,
    };

    // Save public data (visible to all authenticated users)
    await setDoc(doc(db, "businesses", userId), publicDataWithId);

    // Save private data in subcollection (only visible to owner)
    await setDoc(doc(db, "businesses", userId, "private", "details"), {
      userId,
      phone,
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
      approvalStatus: approvalStatus || "pending", // Default to pending for new businesses
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
        approvalStatus: "pending" as const,
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
    const { phone, createdAt, updatedAt, approvalStatus, ...publicData } = businessData;

    // Update public data
    if (Object.keys(publicData).length > 0) {
      const publicDataWithId = {
        ...publicData,
        businessId: userId, // Ensure businessId is always set
      };
      await setDoc(doc(db, "businesses", userId), publicDataWithId, { merge: true });
    }

    // Update private data
    const privateUpdates: any = { updatedAt: new Date() };
    if (phone !== undefined) privateUpdates.phone = phone;
    if (createdAt !== undefined) privateUpdates.createdAt = createdAt;
    if (approvalStatus !== undefined) privateUpdates.approvalStatus = approvalStatus;

    await setDoc(doc(db, "businesses", userId, "private", "details"), privateUpdates, { merge: true });
  } catch (error) {
    console.error("Error updating business data:", error);
    throw error;
  }
};

// ============================================
// STUDENT PROFILES
// ============================================
export interface StudentProfile {
  userId: string;
  name: string;
  email: string;
  skills: string[]; // Array of skills
  desiredRoles: string[]; // Array of desired roles/positions
  bio?: string; // Strengths, characteristics, about me
  portfolioUrl?: string; // Optional portfolio link
  linkedinUrl?: string; // Optional LinkedIn
  openToMatching?: boolean; // Whether student wants to be matched to opportunities
  createdAt: Date | any;
  updatedAt?: Date | any;
}

export const saveStudentProfile = async (profile: StudentProfile): Promise<void> => {
  try {
    await setDoc(doc(db, "students", profile.userId), {
      ...profile,
      createdAt: profile.createdAt || new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error saving student profile:", error);
    throw error;
  }
};

export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  try {
    const docRef = doc(db, "students", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as StudentProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

export const updateStudentProfile = async (userId: string, profile: Partial<StudentProfile>): Promise<void> => {
  try {
    await setDoc(doc(db, "students", userId), {
      ...profile,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
};

export const updateMatchingPreference = async (userId: string, openToMatching: boolean): Promise<void> => {
  try {
    await updateStudentProfile(userId, { openToMatching });
  } catch (error) {
    console.error("Error updating matching preference:", error);
    throw error;
  }
};

export interface Application {
  id?: string;
  studentId: string;
  studentName: string;
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
      const data = doc.data() as PublicBusinessData;
      // Ensure businessId is set to the document ID (which is the user's UID)
      businesses.push({
        ...data,
        businessId: doc.id,
      });
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
      status: "pending", // pending, completed, rejected
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving application:", error);
    throw error;
  }
};

// ============================================
// CATEGORIES
// ============================================
export const CATEGORIES = [
  "Marketing",
  "Photography",
  "Computer Science",
  "Web Development",
  "Graphic Design",
  "Content Writing",
  "Social Media",
  "Video Production",
  "Data Analysis",
  "Business Strategy",
  "Other"
] as const;

export type Category = typeof CATEGORIES[number];

// ============================================
// RATINGS
// ============================================
export interface Rating {
  id?: string;
  businessId: string;
  studentId: string;
  applicationId: string;
  overallRating: number; // 1-5
  communicationRating: number; // 1-5
  professionalismRating: number; // 1-5
  skillQualityRating: number; // 1-5
  feedback?: string;
  createdAt: Date | any;
  projectCompletedAt: Date | any;
}

export const saveRating = async (rating: Omit<Rating, "id" | "createdAt">): Promise<string> => {
  try {
    const ratingsRef = collection(db, "ratings");
    const docRef = await addDoc(ratingsRef, {
      ...rating,
      createdAt: new Date(),
    });

    // Update application status to rated
    await updateDoc(doc(db, "applications", rating.applicationId), {
      status: "rated",
      ratingId: docRef.id,
    });

    // Increment business completed projects count
    await incrementCompletedProjects(rating.businessId);

    return docRef.id;
  } catch (error) {
    console.error("Error saving rating:", error);
    throw error;
  }
};

export const getRatingsForStudent = async (studentId: string): Promise<Rating[]> => {
  try {
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);

    const ratings: Rating[] = [];
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() } as Rating);
    });

    return ratings;
  } catch (error) {
    console.error("Error fetching ratings for student:", error);
    throw error;
  }
};

export const getApplicationsForBusiness = async (businessId: string): Promise<Application[]> => {
  try {
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("businessId", "==", businessId));
    const querySnapshot = await getDocs(q);

    const applications: Application[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as Application);
    });

    return applications;
  } catch (error) {
    console.error("Error fetching applications for business:", error);
    throw error;
  }
};

export const markApplicationCompleted = async (applicationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "applications", applicationId), {
      status: "completed",
      completedAt: new Date(),
    });
  } catch (error) {
    console.error("Error marking application completed:", error);
    throw error;
  }
};

// ============================================
// BADGE SYSTEM
// ============================================
export interface BadgeStatus {
  completedProjects: number;
  badge: "none" | "returning" | "frequent";
}

const incrementCompletedProjects = async (businessId: string): Promise<void> => {
  try {
    const badgeDocRef = doc(db, "businesses", businessId, "private", "badge");
    const badgeDoc = await getDoc(badgeDocRef);

    if (badgeDoc.exists()) {
      await updateDoc(badgeDocRef, {
        completedProjects: increment(1),
        updatedAt: new Date(),
      });
    } else {
      await setDoc(badgeDocRef, {
        completedProjects: 1,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error incrementing completed projects:", error);
    throw error;
  }
};

export const getBadgeStatus = async (businessId: string): Promise<BadgeStatus> => {
  try {
    const badgeDocRef = doc(db, "businesses", businessId, "private", "badge");
    const badgeDoc = await getDoc(badgeDocRef);

    const completedProjects = badgeDoc.exists() ? (badgeDoc.data().completedProjects || 0) : 0;

    let badge: "none" | "returning" | "frequent" = "none";
    if (completedProjects >= 5) {
      badge = "frequent";
    } else if (completedProjects >= 1) {
      badge = "returning";
    }

    return { completedProjects, badge };
  } catch (error) {
    console.error("Error fetching badge status:", error);
    return { completedProjects: 0, badge: "none" };
  }
};

// Get badge statuses for all businesses (for displaying in listings)
export const getAllBusinessesWithBadges = async (): Promise<(PublicBusinessData & { badge: BadgeStatus["badge"] })[]> => {
  try {
    const businesses = await getAllBusinesses();

    const businessesWithBadges = await Promise.all(
      businesses.map(async (business) => {
        const badgeStatus = await getBadgeStatus(business.businessId);
        return {
          ...business,
          badge: badgeStatus.badge,
        };
      })
    );

    return businessesWithBadges;
  } catch (error) {
    console.error("Error fetching businesses with badges:", error);
    throw error;
  }
};

// ============================================
// STUDENT-BUSINESS ASSIGNMENTS
// ============================================
export interface StudentAssignment {
  studentId: string;
  businessId: string;
  assignedAt: Date | any;
  assignedBy?: string; // Admin who made the assignment
  notes?: string; // Optional notes about the assignment
}

// Assign a student to a business
export const assignStudentToBusiness = async (
  businessId: string,
  studentId: string,
  assignedBy?: string,
  notes?: string
): Promise<void> => {
  try {
    await setDoc(doc(db, "businesses", businessId, "assignedStudents", studentId), {
      studentId,
      businessId,
      assignedAt: new Date(),
      assignedBy: assignedBy || "admin",
      notes: notes || "",
    });
  } catch (error) {
    console.error("Error assigning student to business:", error);
    throw error;
  }
};

// Get all students assigned to a business
export const getAssignedStudents = async (businessId: string): Promise<StudentProfile[]> => {
  try {
    const assignedStudentsRef = collection(db, "businesses", businessId, "assignedStudents");
    const querySnapshot = await getDocs(assignedStudentsRef);

    const students: StudentProfile[] = [];

    // Fetch full student profiles for each assigned student
    for (const assignmentDoc of querySnapshot.docs) {
      const studentId = assignmentDoc.data().studentId;
      const studentProfile = await getStudentProfile(studentId);
      if (studentProfile) {
        students.push(studentProfile);
      }
    }

    return students;
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    throw error;
  }
};

// Remove a student assignment from a business
export const removeStudentAssignment = async (businessId: string, studentId: string): Promise<void> => {
  try {
    const assignmentDocRef = doc(db, "businesses", businessId, "assignedStudents", studentId);
    await deleteDoc(assignmentDocRef);
  } catch (error) {
    console.error("Error removing student assignment:", error);
    throw error;
  }
};

// ============================================
// ADMIN APPROVAL FUNCTIONS
// ============================================
export interface BusinessWithApprovalStatus extends BusinessData {
  approvalStatus: "pending" | "approved" | "rejected";
}

// Get all businesses pending approval
export const getPendingBusinesses = async (): Promise<BusinessWithApprovalStatus[]> => {
  try {
    const businessesRef = collection(db, "businesses");
    const querySnapshot = await getDocs(businessesRef);
    const pendingBusinesses: BusinessWithApprovalStatus[] = [];

    for (const businessDoc of querySnapshot.docs) {
      const publicData = businessDoc.data() as PublicBusinessData;

      // Get private data including approval status
      const privateDocRef = doc(db, "businesses", businessDoc.id, "private", "details");
      const privateDocSnap = await getDoc(privateDocRef);

      if (privateDocSnap.exists()) {
        const privateData = privateDocSnap.data() as PrivateBusinessData;

        // Only include pending businesses
        if (privateData.approvalStatus === "pending") {
          pendingBusinesses.push({
            ...publicData,
            ...privateData,
            approvalStatus: "pending",
          } as BusinessWithApprovalStatus);
        }
      }
    }

    return pendingBusinesses;
  } catch (error) {
    console.error("Error fetching pending businesses:", error);
    throw error;
  }
};

// Approve a business account
export const approveBusiness = async (userId: string): Promise<void> => {
  try {
    await updateBusinessData(userId, { approvalStatus: "approved" });
  } catch (error) {
    console.error("Error approving business:", error);
    throw error;
  }
};

// Reject a business account
export const rejectBusiness = async (userId: string): Promise<void> => {
  try {
    await updateBusinessData(userId, { approvalStatus: "rejected" });
  } catch (error) {
    console.error("Error rejecting business:", error);
    throw error;
  }
};
