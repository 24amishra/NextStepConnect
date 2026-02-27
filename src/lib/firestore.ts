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
  approvalStatus?: "pending" | "approved" | "rejected"; // Public so students can filter
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
    const { userId, phone, createdAt, updatedAt, ...publicData } = businessData;

    // Ensure businessId is set to userId and include approval status in public data
    const publicDataWithId = {
      ...publicData,
      businessId: userId,
      approvalStatus: businessData.approvalStatus || "pending", // Default to pending, make it public
    };

    // Save public data (visible to all authenticated users)
    await setDoc(doc(db, "businesses", userId), publicDataWithId);

    // Save private data in subcollection (only visible to owner)
    await setDoc(doc(db, "businesses", userId, "private", "details"), {
      userId,
      phone,
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
      approvalStatus: businessData.approvalStatus || "pending", // Keep in private too for consistency
    });
  } catch (error) {
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

      // Debug logging
      console.log("🔍 Business Data Debug:");
      console.log("Public approvalStatus:", publicData.approvalStatus);
      console.log("Private approvalStatus:", privateData.approvalStatus);
      console.log("Private doc exists:", privateDocSnap.exists());

      return {
        ...publicData,
        ...privateData,
      } as BusinessData;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const updateBusinessData = async (userId: string, businessData: Partial<BusinessData>): Promise<void> => {
  try {
    const { phone, createdAt, updatedAt, approvalStatus, ...publicData } = businessData;

    // Update public data (including approval status if provided)
    const publicDataWithId: any = {
      ...publicData,
      businessId: userId, // Ensure businessId is always set
    };

    // Add approval status to public data if it's being updated
    if (approvalStatus !== undefined) {
      publicDataWithId.approvalStatus = approvalStatus;
    }

    console.log("💾 Updating business data:");
    console.log("userId:", userId);
    console.log("approvalStatus:", approvalStatus);
    console.log("publicDataWithId:", publicDataWithId);
    console.log("Will update public?", Object.keys(publicDataWithId).length > 1);

    if (Object.keys(publicDataWithId).length > 1) { // More than just businessId
      await setDoc(doc(db, "businesses", userId), publicDataWithId, { merge: true });
      console.log("✅ Public document updated");
    }

    // Update private data
    const privateUpdates: any = { updatedAt: new Date() };
    if (phone !== undefined) privateUpdates.phone = phone;
    if (createdAt !== undefined) privateUpdates.createdAt = createdAt;
    if (approvalStatus !== undefined) privateUpdates.approvalStatus = approvalStatus;

    console.log("Private updates:", privateUpdates);

    await setDoc(doc(db, "businesses", userId, "private", "details"), privateUpdates, { merge: true });
    console.log("✅ Private document updated");
  } catch (error) {
    console.error("❌ Error updating business data:", error);
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
    throw error;
  }
};

export const updateMatchingPreference = async (userId: string, openToMatching: boolean): Promise<void> => {
  try {
    await updateStudentProfile(userId, { openToMatching });
  } catch (error) {
    throw error;
  }
};

export const getAllStudents = async (): Promise<StudentProfile[]> => {
  try {
    const studentsRef = collection(db, "students");
    const querySnapshot = await getDocs(studentsRef);
    const students: StudentProfile[] = [];

    querySnapshot.forEach((doc) => {
      students.push(doc.data() as StudentProfile);
    });

    return students;
  } catch (error) {
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
  status?: "pending" | "accepted" | "completed" | "rejected" | "rated";
  acceptedAt?: Date | any;
  completedAt?: Date | any;
}

// This returns only public data for APPROVED businesses (safe for all authenticated users to see)
export const getAllBusinesses = async (): Promise<PublicBusinessData[]> => {
  try {
    const businessesRef = collection(db, "businesses");
    const querySnapshot = await getDocs(businessesRef);
    const businesses: PublicBusinessData[] = [];

    // Filter to only include approved businesses
    querySnapshot.forEach((businessDoc) => {
      const publicData = businessDoc.data() as PublicBusinessData;

      // Check approval status from public data (no longer need to read private subcollection)
      if (publicData.approvalStatus === "approved") {
        businesses.push({
          ...publicData,
          businessId: businessDoc.id,
        });
      }
    });

    return businesses;
  } catch (error) {
    throw error;
  }
};

export const saveApplication = async (application: Omit<Application, "id">): Promise<string> => {
  try {
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, {
      ...application,
      appliedAt: new Date(),
      status: "pending", // pending, accepted, completed, rejected, rated
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Accept an application (business accepts student's application)
export const acceptApplication = async (applicationId: string): Promise<void> => {
  try {
    console.log("🔄 acceptApplication called with ID:", applicationId);

    // First, get the application to extract student and business IDs
    const appDoc = await getDoc(doc(db, "applications", applicationId));
    if (!appDoc.exists()) {
      console.error("❌ Application document not found");
      throw new Error("Application not found");
    }

    const application = appDoc.data() as Application;
    console.log("📋 Application data:", {
      studentId: application.studentId,
      businessId: application.businessId,
      studentName: application.studentName
    });

    // Update application status
    console.log("📝 Updating application status to 'accepted'...");
    await updateDoc(doc(db, "applications", applicationId), {
      status: "accepted",
      acceptedAt: new Date(),
    });
    console.log("✅ Application status updated");

    // Automatically create a student-business assignment (partnership)
    // This makes the student appear in the business's "Assigned Students" section
    console.log("🤝 Creating student-business assignment...");
    console.log("   businessId:", application.businessId, "type:", typeof application.businessId);
    console.log("   studentId:", application.studentId, "type:", typeof application.studentId);

    if (!application.businessId) {
      throw new Error("businessId is missing from application");
    }
    if (!application.studentId) {
      throw new Error("studentId is missing from application");
    }

    await assignStudentToBusiness(
      application.businessId,
      application.studentId,
      "business-acceptance", // Indicates this was from business accepting application
      `Accepted from application on ${new Date().toLocaleDateString()}`
    );

    console.log("✅ Application accepted and student assigned to business");
  } catch (error) {
    console.error("❌ Error in acceptApplication:", error);
    throw error;
  }
};

// Reject an application
export const rejectApplication = async (applicationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "applications", applicationId), {
      status: "rejected",
    });
  } catch (error) {
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
    throw error;
  }
};

export const getApplicationsForStudent = async (studentId: string): Promise<Application[]> => {
  try {
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);

    const applications: Application[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as Application);
    });

    return applications;
  } catch (error) {
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
    console.log("🤝 assignStudentToBusiness called:");
    console.log("   businessId:", businessId);
    console.log("   studentId:", studentId);
    console.log("   assignedBy:", assignedBy);
    console.log("   Path:", `businesses/${businessId}/assignedStudents/${studentId}`);

    const assignmentRef = doc(db, "businesses", businessId, "assignedStudents", studentId);
    const assignmentData = {
      studentId,
      businessId,
      assignedAt: new Date(),
      assignedBy: assignedBy || "admin",
      notes: notes || "",
    };

    console.log("   Data to write:", assignmentData);

    await setDoc(assignmentRef, assignmentData);

    console.log("✅ Student assignment created successfully");

    // Verify it was written
    const verifyDoc = await getDoc(assignmentRef);
    if (verifyDoc.exists()) {
      console.log("✅ Verified: Assignment document exists in database");
    } else {
      console.error("❌ WARNING: Assignment document was NOT found after writing!");
    }
  } catch (error) {
    console.error("❌ Error in assignStudentToBusiness:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    throw error;
  }
};

// Get all students assigned to a business
export const getAssignedStudents = async (businessId: string): Promise<StudentProfile[]> => {
  try {
    console.log("👥 getAssignedStudents called for businessId:", businessId);
    console.log("   Path:", `businesses/${businessId}/assignedStudents`);

    const assignedStudentsRef = collection(db, "businesses", businessId, "assignedStudents");
    const querySnapshot = await getDocs(assignedStudentsRef);

    console.log("   Found", querySnapshot.size, "assigned student documents");

    const students: StudentProfile[] = [];

    // Fetch full student profiles for each assigned student
    for (const assignmentDoc of querySnapshot.docs) {
      const studentId = assignmentDoc.data().studentId;
      console.log("   Fetching profile for studentId:", studentId);
      const studentProfile = await getStudentProfile(studentId);
      if (studentProfile) {
        students.push(studentProfile);
        console.log("   ✓ Added student:", studentProfile.name);
      } else {
        console.log("   ✗ Student profile not found for:", studentId);
      }
    }

    console.log("✅ Returning", students.length, "assigned students");
    return students;
  } catch (error) {
    console.error("❌ Error in getAssignedStudents:", error);
    throw error;
  }
};

// Get all APPROVED businesses assigned to a student (reverse lookup)
export const getBusinessesAssignedToStudent = async (studentId: string): Promise<PublicBusinessData[]> => {
  try {
    // Get all businesses
    const businessesRef = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesRef);

    const assignedBusinesses: PublicBusinessData[] = [];

    // Check each business to see if this student is assigned
    for (const businessDoc of businessesSnapshot.docs) {
      const assignedStudentDoc = await getDoc(
        doc(db, "businesses", businessDoc.id, "assignedStudents", studentId)
      );

      if (assignedStudentDoc.exists()) {
        const businessData = businessDoc.data() as PublicBusinessData;

        // Only include approved businesses in matched opportunities (check public data)
        if (businessData.approvalStatus === "approved") {
          assignedBusinesses.push({
            ...businessData,
            businessId: businessDoc.id,
          });
        }
      }
    }

    return assignedBusinesses;
  } catch (error) {
    throw error;
  }
};

// Remove a student assignment from a business
export const removeStudentAssignment = async (businessId: string, studentId: string): Promise<void> => {
  try {
    const assignmentDocRef = doc(db, "businesses", businessId, "assignedStudents", studentId);
    await deleteDoc(assignmentDocRef);
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Admin configuration - store admin email
const ADMIN_EMAIL = "nextstep.connects@gmail.com"; // Change this to your admin email

export const isAdmin = (email: string | null | undefined): boolean => {
  return email === ADMIN_EMAIL;
};

// Get all partnerships (student-business assignments with details)
export interface Partnership {
  studentId: string;
  businessId: string;
  student?: StudentProfile;
  business?: PublicBusinessData;
  assignedAt: Date | any;
  assignedBy?: string;
  notes?: string;
}

export const getAllPartnerships = async (): Promise<Partnership[]> => {
  try {
    const partnerships: Partnership[] = [];

    // Get all businesses
    const businessesRef = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesRef);

    // For each business, get their assigned students
    for (const businessDoc of businessesSnapshot.docs) {
      const assignedStudentsRef = collection(db, "businesses", businessDoc.id, "assignedStudents");
      const assignedStudentsSnapshot = await getDocs(assignedStudentsRef);

      for (const assignmentDoc of assignedStudentsSnapshot.docs) {
        const assignmentData = assignmentDoc.data();

        // Fetch full student and business profiles
        const studentProfile = await getStudentProfile(assignmentData.studentId);
        const businessData = businessDoc.data() as PublicBusinessData;

        partnerships.push({
          studentId: assignmentData.studentId,
          businessId: businessDoc.id,
          student: studentProfile || undefined,
          business: { ...businessData, businessId: businessDoc.id },
          assignedAt: assignmentData.assignedAt,
          assignedBy: assignmentData.assignedBy,
          notes: assignmentData.notes,
        });
      }
    }

    // Sort by most recent first
    partnerships.sort((a, b) => {
      const dateA = a.assignedAt?.toDate ? a.assignedAt.toDate() : new Date(a.assignedAt);
      const dateB = b.assignedAt?.toDate ? b.assignedAt.toDate() : new Date(b.assignedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return partnerships;
  } catch (error) {
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
    throw error;
  }
};

// Approve a business account
export const approveBusiness = async (userId: string): Promise<void> => {
  try {
    await updateBusinessData(userId, { approvalStatus: "approved" });
  } catch (error) {
    throw error;
  }
};

// Reject a business account
export const rejectBusiness = async (userId: string): Promise<void> => {
  try {
    await updateBusinessData(userId, { approvalStatus: "rejected" });
  } catch (error) {
    throw error;
  }
};

// Get all approved businesses (for admin use)
export const getApprovedBusinesses = async (): Promise<BusinessData[]> => {
  try {
    const businessesRef = collection(db, "businesses");
    const querySnapshot = await getDocs(businessesRef);
    const approvedBusinesses: BusinessData[] = [];

    for (const businessDoc of querySnapshot.docs) {
      const publicData = businessDoc.data() as PublicBusinessData;

      // Check approval status from public data
      if (publicData.approvalStatus === "approved") {
        // Get private data for admin use (phone, etc.)
        const privateDocRef = doc(db, "businesses", businessDoc.id, "private", "details");
        const privateDocSnap = await getDoc(privateDocRef);

        if (privateDocSnap.exists()) {
          const privateData = privateDocSnap.data() as PrivateBusinessData;
          approvedBusinesses.push({
            ...publicData,
            ...privateData,
          } as BusinessData);
        }
      }
    }

    return approvedBusinesses;
  } catch (error) {
    throw error;
  }
};
