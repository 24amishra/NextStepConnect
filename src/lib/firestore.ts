import { db, storage } from "./firebase";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, Timestamp, DocumentData, updateDoc, increment, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Sentinel uid used only by src/pages/DevDashboardPreview.tsx (dev-only, import.meta.env.DEV)
// to render dashboards with realistic fixture data instead of hitting Firestore with a
// fake session. Real Firebase uids are never this string, so this can't collide.
const DEV_PREVIEW_UID = "dev-preview-uid";

// Flipped on by DevDashboardPreview.tsx for list-style reads (no uid to key off of).
export const devPreviewState = { active: false };

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
  onHold?: boolean;
}

// ============================================
// OPPORTUNITIES
// ============================================
export interface Opportunity {
  id?: string;
  businessId: string;
  businessName: string; // Denormalized for performance
  title: string;
  description: string;
  categories: string[];
  customQuestions?: CustomQuestion[];
  status: "active" | "closed" | "draft";
  createdAt: Date | any;
  updatedAt?: Date | any;
  applicationCount?: number; // Cached count for performance
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
  if (userId === DEV_PREVIEW_UID) {
    return {
      businessId: userId,
      userId,
      companyName: "Blue Sky Coffee Co.",
      location: "Columbus, OH",
      industry: "We're a specialty coffee roaster and cafe looking to modernize our online ordering and grow our local following.",
      contactPersonName: "Jordan Blake",
      email: "jordan@blueskycoffee.example",
      phone: "(614) 555-0148",
      preferredContactMethod: "Email",
      potentialProblems: "We need help redesigning our online ordering flow, running a social media content calendar, and setting up basic sales reporting.",
      categories: ["Marketing", "Web Design", "Data Analysis"],
      approvalStatus: "approved",
      createdAt: new Date("2025-09-12"),
    };
  }

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
  matchingCategories?: string[]; // Categories the student is interested in for their next match
  matchingNote?: string; // Optional note about availability/preferences for the next match
  matchingRequestedAt?: Date | any; // When the student last asked to be matched
  createdAt: Date | any;
  updatedAt?: Date | any;
  onHold?: boolean;
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
  if (userId === DEV_PREVIEW_UID) {
    return {
      userId,
      name: "Karina Chen",
      email: "preview@example.com",
      skills: ["Figma", "React", "User Research"],
      desiredRoles: ["Product Design", "Frontend Development"],
      bio: "Junior studying UX design. I like turning messy workflows into simple, usable products.",
      linkedinUrl: "https://linkedin.com/in/example",
      openToMatching: true,
      createdAt: new Date("2025-10-03"),
    };
  }

  try {
    const docRef = doc(db, "students", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Ensure userId is included from document ID
      return {
        ...docSnap.data(),
        userId: docSnap.id
      } as StudentProfile;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateStudentProfile = async (userId: string, profile: Partial<StudentProfile>): Promise<void> => {
  if (userId === DEV_PREVIEW_UID) {
    return;
  }

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

/** Student taps "+" to ask NextStep to find them a partnership. */
export const requestMatching = async (
  userId: string,
  categories: string[],
  note?: string
): Promise<void> => {
  await updateStudentProfile(userId, {
    openToMatching: true,
    matchingCategories: categories,
    matchingNote: note || "",
    matchingRequestedAt: new Date(),
  });
};

/** Student is matched or wants to stop being considered for now. */
export const cancelMatchingRequest = async (userId: string): Promise<void> => {
  await updateStudentProfile(userId, { openToMatching: false });
};

/** All students currently asking to be matched — for admin to review and pair. */
export const getStudentsSeekingMatch = async (): Promise<StudentProfile[]> => {
  if (devPreviewState.active) {
    return [
      {
        userId: "dev-student-seeking-1",
        name: "Marcus Webb",
        email: "marcus@example.com",
        skills: ["Video Editing", "Canva", "Copywriting"],
        desiredRoles: ["Content Creation"],
        openToMatching: true,
        matchingCategories: ["Marketing", "Social Media"],
        matchingNote: "I have about 5 hours a week free this month and would love a marketing-focused project.",
        matchingRequestedAt: new Date("2026-07-18"),
        createdAt: new Date("2025-11-01"),
      },
      {
        userId: "dev-student-seeking-2",
        name: "Priya Nair",
        email: "priya@example.com",
        skills: ["Excel", "SQL", "Data Visualization"],
        desiredRoles: ["Data Analysis"],
        openToMatching: true,
        matchingCategories: ["Data Analysis"],
        matchingRequestedAt: new Date("2026-07-15"),
        createdAt: new Date("2026-02-14"),
      },
    ];
  }

  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("openToMatching", "==", true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id } as StudentProfile));
};

export const getAllStudents = async (): Promise<StudentProfile[]> => {
  if (devPreviewState.active) {
    return getStudentsSeekingMatch();
  }

  try {
    const studentsRef = collection(db, "students");
    const querySnapshot = await getDocs(studentsRef);
    const students: StudentProfile[] = [];

    querySnapshot.forEach((doc) => {
      // Ensure userId is included from document ID
      students.push({
        ...doc.data(),
        userId: doc.id
      } as StudentProfile);
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
  opportunityId?: string; // NEW - optional for backward compatibility
  opportunityTitle?: string; // NEW - denormalized for display
  answers: { [questionId: string]: string };
  appliedAt: Date | any;
  status?: "pending" | "accepted" | "completed" | "rejected" | "rated" | "dismissed";
  type?: "application" | "interest";
  acceptedAt?: Date | any;
  completedAt?: Date | any;
  dismissedAt?: Date | any;
  dismissedBy?: string;
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

// ============================================
// OPPORTUNITY CRUD FUNCTIONS
// ============================================

// CREATE
export const createOpportunity = async (opportunity: Omit<Opportunity, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const opportunitiesRef = collection(db, "opportunities");
  const docRef = await addDoc(opportunitiesRef, {
    ...opportunity,
    createdAt: new Date(),
    updatedAt: new Date(),
    applicationCount: 0,
  });
  return docRef.id;
};

// READ
export const getOpportunity = async (opportunityId: string): Promise<Opportunity | null> => {
  const docRef = doc(db, "opportunities", opportunityId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Opportunity : null;
};

export const getOpportunitiesForBusiness = async (businessId: string): Promise<Opportunity[]> => {
  const q = query(collection(db, "opportunities"), where("businessId", "==", businessId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
};

export const getAllActiveOpportunities = async (): Promise<Opportunity[]> => {
  if (devPreviewState.active) {
    return [
      {
        id: "dev-opp-1",
        businessId: "dev-biz-1",
        businessName: "Blue Sky Coffee Co.",
        title: "Redesign online ordering flow",
        description: "We need a cleaner, faster checkout for our online ordering site. You'd audit the current flow, propose wireframes, and help implement the redesign with our team.",
        categories: ["Web Design", "UX Research"],
        status: "active",
        createdAt: new Date("2026-06-20"),
      },
      {
        id: "dev-opp-2",
        businessId: "dev-biz-2",
        businessName: "Maple & Co. Bookkeeping",
        title: "Build a social media content calendar",
        description: "Looking for a student to plan and design a month of Instagram and LinkedIn posts to help us reach more local small-business clients.",
        categories: ["Marketing"],
        status: "active",
        createdAt: new Date("2026-06-18"),
      },
      {
        id: "dev-opp-3",
        businessId: "dev-biz-3",
        businessName: "Riverside Bike Shop",
        title: "Basic sales dashboard",
        description: "We track sales in spreadsheets and want a simple dashboard to visualize monthly trends and best-selling products.",
        categories: ["Data Analysis", "Web Design"],
        status: "active",
        createdAt: new Date("2026-06-10"),
      },
    ] as Opportunity[];
  }

  const q = query(collection(db, "opportunities"), where("status", "==", "active"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
};

// UPDATE
export const updateOpportunity = async (opportunityId: string, updates: Partial<Opportunity>): Promise<void> => {
  const docRef = doc(db, "opportunities", opportunityId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const closeOpportunity = async (opportunityId: string): Promise<void> => {
  await updateOpportunity(opportunityId, { status: "closed" });
};

// DELETE
export const deleteOpportunity = async (opportunityId: string): Promise<void> => {
  // First check if there are any applications
  const applications = await getApplicationsForOpportunity(opportunityId);
  const activeApplications = applications.filter(app =>
    app.status === "pending" || app.status === "accepted" || app.status === "completed"
  );

  if (activeApplications.length > 0) {
    throw new Error("Cannot delete opportunity with active applications. Please close it instead.");
  }

  await deleteDoc(doc(db, "opportunities", opportunityId));
};

// UTILITY
export const incrementOpportunityApplicationCount = async (opportunityId: string): Promise<void> => {
  const docRef = doc(db, "opportunities", opportunityId);
  await updateDoc(docRef, {
    applicationCount: increment(1)
  });
};

export const getApplicationsForOpportunity = async (opportunityId: string): Promise<Application[]> => {
  const q = query(collection(db, "applications"), where("opportunityId", "==", opportunityId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
};

export const saveApplication = async (application: Omit<Application, "id">): Promise<string> => {
  try {
    const applicationsRef = collection(db, "applications");
    // Filter out undefined values — Firestore rejects them
    const data: Record<string, any> = {
      ...application,
      appliedAt: new Date(),
      status: "pending", // pending, accepted, completed, rejected, rated
    };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    const docRef = await addDoc(applicationsRef, data);

    // Increment opportunity application count (fire-and-forget so it can't fail the submission)
    if (application.opportunityId) {
      incrementOpportunityApplicationCount(application.opportunityId).catch(console.error);
    }

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const saveInterest = async (interest: Omit<Application, "id">): Promise<string> => {
  try {
    const applicationsRef = collection(db, "applications");
    // Filter out undefined values — Firestore rejects them
    const data: Record<string, any> = {
      ...interest,
      appliedAt: new Date(),
      status: "pending",
      type: "interest",
    };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    const docRef = await addDoc(applicationsRef, data);

    if (interest.opportunityId) {
      incrementOpportunityApplicationCount(interest.opportunityId).catch(console.error);
    }

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getAllPendingInterests = async (): Promise<Application[]> => {
  try {
    const applicationsRef = collection(db, "applications");
    const q = query(
      applicationsRef,
      where("type", "==", "interest"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    const interests: Application[] = [];
    querySnapshot.forEach((doc) => {
      interests.push({ id: doc.id, ...doc.data() } as Application);
    });
    return interests;
  } catch (error) {
    throw error;
  }
};

export const dismissInterest = async (id: string, adminEmail: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "applications", id), {
      status: "dismissed",
      dismissedAt: new Date(),
      dismissedBy: adminEmail,
    });
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

    // Automatically create a student-opportunity assignment
    // This makes the student appear in the business's "Assigned Students" section grouped by opportunity
    console.log("🤝 Creating student-opportunity assignment...");
    console.log("   opportunityId:", application.opportunityId, "type:", typeof application.opportunityId);
    console.log("   studentId:", application.studentId, "type:", typeof application.studentId);

    if (!application.opportunityId) {
      throw new Error("Application missing opportunityId - cannot assign to opportunity");
    }
    if (!application.studentId) {
      throw new Error("studentId is missing from application");
    }

    await assignStudentToOpportunity(
      application.opportunityId,
      application.studentId,
      applicationId, // Reference to application
      "business-acceptance", // Indicates this was from business accepting application
      `Accepted from application on ${new Date().toLocaleDateString()}`
    );

    console.log("✅ Application accepted and student assigned to opportunity");
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
// COMMUNITY FEED
// Admin-posted spotlights on what's happening across NextStep right now.
// ============================================
export interface Post {
  id?: string;
  authorEmail: string;
  caption: string;
  businessName?: string;
  category?: string;
  likedBy: string[];
  createdAt: Date | any;
}

export const createPost = async (
  post: Omit<Post, "id" | "createdAt" | "likedBy">
): Promise<string> => {
  if (devPreviewState.active) {
    return "dev-post-id";
  }

  const postsRef = collection(db, "posts");
  const data: Record<string, any> = {
    ...post,
    likedBy: [],
    createdAt: new Date(),
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  const docRef = await addDoc(postsRef, data);
  return docRef.id;
};

export const getAllPosts = async (): Promise<Post[]> => {
  if (devPreviewState.active) {
    return [
      {
        id: "dev-post-1",
        authorEmail: "admin@nextstep.com",
        caption: "A full checkout redesign just kicked off with Blue Sky Coffee Co. — excited to see this one come together!",
        businessName: "Blue Sky Coffee Co.",
        category: "Web Design",
        likedBy: ["dev-preview-uid"],
        createdAt: new Date("2026-07-15"),
      },
      {
        id: "dev-post-2",
        authorEmail: "admin@nextstep.com",
        caption: "Wrapped up a sales dashboard project with Riverside Bike Shop this week. Great work all around!",
        businessName: "Riverside Bike Shop",
        category: "Data Analysis",
        likedBy: [],
        createdAt: new Date("2026-07-10"),
      },
      {
        id: "dev-post-3",
        authorEmail: "admin@nextstep.com",
        caption: "We've got 3 new local businesses ready to partner this month. If you're open to matching, tap the button on your Partnerships page!",
        likedBy: ["dev-preview-uid", "dev-student-seeking-1"],
        createdAt: new Date("2026-07-05"),
      },
    ];
  }

  const postsRef = collection(db, "posts");
  const querySnapshot = await getDocs(postsRef);
  const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
  posts.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });
  return posts;
};

export const toggleLikePost = async (postId: string, userId: string, isLiked: boolean): Promise<void> => {
  if (devPreviewState.active) return;

  await updateDoc(doc(db, "posts", postId), {
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

export const deletePost = async (postId: string): Promise<void> => {
  if (devPreviewState.active) return;
  await deleteDoc(doc(db, "posts", postId));
};

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
  if (studentId === DEV_PREVIEW_UID) {
    return [
      {
        id: "dev-1",
        businessId: DEV_PREVIEW_UID,
        studentId,
        applicationId: "dev-app-1",
        overallRating: 5,
        communicationRating: 5,
        professionalismRating: 5,
        skillQualityRating: 4,
        feedback: "Karina redesigned our checkout flow in two weeks and completions went up right away. Clear communicator, easy to work with.",
        createdAt: new Date("2026-05-02"),
        projectCompletedAt: new Date("2026-05-01"),
      },
      {
        id: "dev-2",
        businessId: DEV_PREVIEW_UID,
        studentId,
        applicationId: "dev-app-2",
        overallRating: 4,
        communicationRating: 4,
        professionalismRating: 5,
        skillQualityRating: 4,
        feedback: "Great eye for detail on our style guide. Would happily work with her again.",
        createdAt: new Date("2026-02-14"),
        projectCompletedAt: new Date("2026-02-10"),
      },
    ];
  }

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
  if (studentId === DEV_PREVIEW_UID) {
    return [
      {
        id: "dev-app-past",
        studentId,
        studentName: "Karina Chen",
        studentEmail: "preview@example.com",
        businessId: "dev-biz-past",
        businessName: "Riverside Bike Shop",
        answers: {},
        appliedAt: new Date("2026-01-10"),
        status: "completed",
      },
    ];
  }

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
  if (businessId === DEV_PREVIEW_UID) {
    return { completedProjects: 3, badge: "returning" };
  }

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
  if (devPreviewState.active) {
    return [
      {
        businessId: "dev-biz-4",
        companyName: "Corner Deli & Market",
        location: "Columbus, OH",
        industry: "We're a neighborhood deli looking for general help with our online presence.",
        contactPersonName: "Sam Rivera",
        email: "sam@cornerdeli.example",
        preferredContactMethod: "Email",
        potentialProblems: "We don't have a website yet and would love help getting a simple one online, plus setting up Google Business listings.",
        categories: ["Web Design"],
        approvalStatus: "approved",
        badge: "none",
      },
    ];
  }

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
// OPPORTUNITY-LEVEL ASSIGNMENTS (NEW SYSTEM)
// ============================================

/**
 * Assign a student to a specific opportunity (NEW - replaces business-level assignments)
 */
export const assignStudentToOpportunity = async (
  opportunityId: string,
  studentId: string,
  applicationId?: string,
  assignedBy?: string,
  notes?: string
): Promise<void> => {
  try {
    console.log("🎯 assignStudentToOpportunity called:");
    console.log("   opportunityId:", opportunityId);
    console.log("   studentId:", studentId);

    // First, get the opportunity to extract businessId
    const opportunity = await getOpportunity(opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    const assignmentRef = doc(db, "opportunities", opportunityId, "assignedStudents", studentId);
    const assignmentData = {
      studentId,
      opportunityId,
      businessId: opportunity.businessId, // Denormalized for easier queries
      assignedAt: new Date(),
      assignedBy: assignedBy || "admin",
      notes: notes || "",
      applicationId: applicationId || "",
    };

    console.log("   Path:", `opportunities/${opportunityId}/assignedStudents/${studentId}`);
    console.log("   Data to write:", assignmentData);

    await setDoc(assignmentRef, assignmentData);
    console.log("✅ Student assigned to opportunity successfully");

    // They've been paired — take them off the "seeking match" list.
    await cancelMatchingRequest(studentId).catch(console.error);
  } catch (error) {
    console.error("❌ Error in assignStudentToOpportunity:", error);
    throw error;
  }
};

/**
 * Get all students assigned to a specific opportunity
 */
export const getAssignedStudentsForOpportunity = async (opportunityId: string): Promise<StudentProfile[]> => {
  try {
    const assignedStudentsRef = collection(db, "opportunities", opportunityId, "assignedStudents");
    const querySnapshot = await getDocs(assignedStudentsRef);

    const students: StudentProfile[] = [];

    for (const assignmentDoc of querySnapshot.docs) {
      const studentId = assignmentDoc.data().studentId;
      const studentProfile = await getStudentProfile(studentId);
      if (studentProfile) {
        students.push(studentProfile);
      }
    }

    return students;
  } catch (error) {
    console.error("❌ Error in getAssignedStudentsForOpportunity:", error);
    throw error;
  }
};

/**
 * Get all opportunities with their assigned students for a business (Business Dashboard)
 */
export const getAssignedStudentsGroupedByOpportunity = async (businessId: string): Promise<OpportunityWithStudents[]> => {
  try {
    console.log("📊 getAssignedStudentsGroupedByOpportunity for businessId:", businessId);

    // Get all opportunities for this business
    const opportunities = await getOpportunitiesForBusiness(businessId);
    console.log("   Found", opportunities.length, "opportunities");

    const opportunitiesWithStudents: OpportunityWithStudents[] = [];

    // For each opportunity, get assigned students and contract PDFs
    for (const opportunity of opportunities) {
      if (!opportunity.id) continue;

      const assignedStudentsRef = collection(db, "opportunities", opportunity.id, "assignedStudents");
      const querySnapshot = await getDocs(assignedStudentsRef);

      const students: StudentProfile[] = [];
      const contractPdfUrls: { [studentId: string]: string } = {};

      for (const assignmentDoc of querySnapshot.docs) {
        const data = assignmentDoc.data();
        const studentProfile = await getStudentProfile(data.studentId);
        if (studentProfile) {
          students.push(studentProfile);
          if (data.contractPdfUrl) {
            contractPdfUrls[data.studentId] = data.contractPdfUrl;
          }
        }
      }

      // Only include opportunities that have assigned students
      if (students.length > 0) {
        opportunitiesWithStudents.push({
          opportunity,
          students,
          assignmentCount: students.length,
          contractPdfUrls: Object.keys(contractPdfUrls).length > 0 ? contractPdfUrls : undefined,
        });
      }
    }

    console.log("✅ Returning", opportunitiesWithStudents.length, "opportunities with students");
    return opportunitiesWithStudents;
  } catch (error) {
    console.error("❌ Error in getAssignedStudentsGroupedByOpportunity:", error);
    throw error;
  }
};

/**
 * Get all opportunities assigned to a student (Student Dashboard)
 */
export const getOpportunitiesAssignedToStudent = async (studentId: string): Promise<Opportunity[]> => {
  try {
    console.log("🎯 getOpportunitiesAssignedToStudent for studentId:", studentId);

    // Get all opportunities
    const allOpportunities = await getAllActiveOpportunities();
    const assignedOpportunities: Opportunity[] = [];

    // Check each opportunity to see if this student is assigned
    for (const opportunity of allOpportunities) {
      if (!opportunity.id) continue;

      const assignmentDoc = await getDoc(
        doc(db, "opportunities", opportunity.id, "assignedStudents", studentId)
      );

      if (assignmentDoc.exists()) {
        assignedOpportunities.push(opportunity);
      }
    }

    console.log("✅ Found", assignedOpportunities.length, "assigned opportunities");
    return assignedOpportunities;
  } catch (error) {
    console.error("❌ Error in getOpportunitiesAssignedToStudent:", error);
    throw error;
  }
};

/**
 * Get all opportunity assignments (Admin Dashboard)
 * Also includes legacy business-level assignments for backward compatibility
 */
export const getAllOpportunityAssignments = async (): Promise<OpportunityAssignment[]> => {
  if (devPreviewState.active) {
    return getStudentPartnershipAssignments(DEV_PREVIEW_UID);
  }

  try {
    console.log("📋 getAllOpportunityAssignments called");
    const assignments: OpportunityAssignment[] = [];

    // Get all opportunities
    const opportunitiesRef = collection(db, "opportunities");
    const opportunitiesSnapshot = await getDocs(opportunitiesRef);

    // For each opportunity, get assigned students (NEW SYSTEM)
    for (const oppDoc of opportunitiesSnapshot.docs) {
      const assignedStudentsRef = collection(db, "opportunities", oppDoc.id, "assignedStudents");
      const assignedStudentsSnapshot = await getDocs(assignedStudentsRef);

      for (const assignmentDoc of assignedStudentsSnapshot.docs) {
        const assignmentData = assignmentDoc.data();

        // Fetch full profiles
        const studentProfile = await getStudentProfile(assignmentData.studentId);
        const opportunity = await getOpportunity(oppDoc.id);

        // Get business data if opportunity exists
        let businessData: PublicBusinessData | undefined;
        if (opportunity) {
          const businessDoc = await getDoc(doc(db, "businesses", opportunity.businessId));
          if (businessDoc.exists()) {
            businessData = { ...businessDoc.data(), businessId: businessDoc.id } as PublicBusinessData;
          }
        }

        assignments.push({
          studentId: assignmentData.studentId,
          opportunityId: oppDoc.id,
          businessId: assignmentData.businessId,
          student: studentProfile || undefined,
          opportunity: opportunity || undefined,
          business: businessData,
          assignedAt: assignmentData.assignedAt,
          assignedBy: assignmentData.assignedBy,
          notes: assignmentData.notes,
          applicationId: assignmentData.applicationId,
          contractPdfUrl: assignmentData.contractPdfUrl,
          midpointMeetingDate: assignmentData.midpointMeetingDate,
          midpointMeetingCompleted: assignmentData.midpointMeetingCompleted,
        });
      }
    }

    // ALSO get legacy business-level assignments (OLD SYSTEM)
    console.log("📋 Also fetching legacy business-level assignments...");
    const businessesRef = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesRef);

    for (const businessDoc of businessesSnapshot.docs) {
      const assignedStudentsRef = collection(db, "businesses", businessDoc.id, "assignedStudents");
      const assignedStudentsSnapshot = await getDocs(assignedStudentsRef);

      for (const assignmentDoc of assignedStudentsSnapshot.docs) {
        const assignmentData = assignmentDoc.data();

        // Fetch student profile
        const studentProfile = await getStudentProfile(assignmentData.studentId);

        // Get business data
        const businessData = businessDoc.data() as PublicBusinessData;

        // Create a pseudo-assignment with a special opportunityId to indicate it's business-level
        assignments.push({
          studentId: assignmentData.studentId,
          opportunityId: `business-${businessDoc.id}`, // Special ID to indicate legacy/general assignment
          businessId: businessDoc.id,
          student: studentProfile || undefined,
          opportunity: undefined, // No specific opportunity for general assignments
          business: { ...businessData, businessId: businessDoc.id },
          assignedAt: assignmentData.assignedAt,
          assignedBy: assignmentData.assignedBy,
          notes: assignmentData.notes,
          applicationId: undefined,
          contractPdfUrl: assignmentData.contractPdfUrl,
          midpointMeetingDate: assignmentData.midpointMeetingDate,
          midpointMeetingCompleted: assignmentData.midpointMeetingCompleted,
        });
      }
    }

    // Sort by most recent first
    assignments.sort((a, b) => {
      const dateA = a.assignedAt?.toDate ? a.assignedAt.toDate() : new Date(a.assignedAt);
      const dateB = b.assignedAt?.toDate ? b.assignedAt.toDate() : new Date(b.assignedAt);
      return dateB.getTime() - dateA.getTime();
    });

    console.log("✅ Found", assignments.length, "total assignments (including legacy)");
    return assignments;
  } catch (error) {
    console.error("❌ Error in getAllOpportunityAssignments:", error);
    throw error;
  }
};

/**
 * Remove a student from an opportunity
 * Also handles legacy business-level assignments
 */
export const removeStudentFromOpportunity = async (opportunityId: string, studentId: string): Promise<void> => {
  try {
    // Check if this is a legacy business-level assignment
    if (opportunityId.startsWith("business-")) {
      const businessId = opportunityId.replace("business-", "");
      console.log("🗑️ Removing legacy business-level assignment");
      await removeStudentAssignment(businessId, studentId);
    } else {
      // New opportunity-level assignment
      const assignmentDocRef = doc(db, "opportunities", opportunityId, "assignedStudents", studentId);
      await deleteDoc(assignmentDocRef);
      console.log("✅ Student removed from opportunity");
    }
  } catch (error) {
    console.error("❌ Error in removeStudentFromOpportunity:", error);
    throw error;
  }
};

// ============================================
// STUDENT-BUSINESS ASSIGNMENTS (DEPRECATED - USE OPPORTUNITY-LEVEL INSTEAD)
// ============================================
export interface StudentAssignment {
  studentId: string;
  businessId: string;
  assignedAt: Date | any;
  assignedBy?: string; // Admin who made the assignment
  notes?: string; // Optional notes about the assignment
}

/**
 * @deprecated Use assignStudentToOpportunity instead
 * Assigns student to business (old system - loses opportunity context)
 */
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

    // They've been paired — take them off the "seeking match" list.
    await cancelMatchingRequest(studentId).catch(console.error);
  } catch (error) {
    console.error("❌ Error in assignStudentToBusiness:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * @deprecated Use getAssignedStudentsGroupedByOpportunity instead
 * Gets students assigned to business (old system - doesn't show which opportunity)
 */
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

/**
 * @deprecated Use getOpportunitiesAssignedToStudent instead
 * Gets businesses assigned to student (old system - loses opportunity context)
 */
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

/**
 * @deprecated Use removeStudentFromOpportunity instead
 * Removes student from business (old system)
 */
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

/**
 * Check if a user has the admin role.
 * Reads from the Firestore `user_roles/{uid}` document.
 * The document should have a `role` field set to "admin".
 */
export const checkIsAdmin = async (email: string): Promise<boolean> => {
  try {
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("email", "==", email), where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    return false;
  }
};

/**
 * @deprecated Use getAllOpportunityAssignments instead
 * Gets all partnerships (old system - business-level assignments)
 */
export interface Partnership {
  studentId: string;
  businessId: string;
  student?: StudentProfile;
  business?: PublicBusinessData;
  assignedAt: Date | any;
  assignedBy?: string;
  notes?: string;
}

// ============================================
// OPPORTUNITY-LEVEL ASSIGNMENTS (NEW)
// ============================================

export interface OpportunityAssignment {
  studentId: string;
  opportunityId: string;
  businessId: string; // Denormalized for easier queries
  student?: StudentProfile;
  opportunity?: Opportunity;
  business?: PublicBusinessData;
  assignedAt: Date | any;
  assignedBy?: string;
  notes?: string;
  applicationId?: string; // Reference to application that created this
  contractPdfUrl?: string; // URL to the partnership contract PDF
  midpointMeetingDate?: Date | any;
  midpointMeetingCompleted?: boolean;
}

export interface OpportunityWithStudents {
  opportunity: Opportunity;
  students: StudentProfile[];
  assignmentCount: number;
  contractPdfUrls?: { [studentId: string]: string }; // Map of studentId to contract PDF URL
}

/**
 * @deprecated Use getAllOpportunityAssignments instead
 */
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
  if (devPreviewState.active) {
    return [];
  }

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
  if (devPreviewState.active) {
    return [
      {
        userId: "dev-biz-current",
        businessId: "dev-biz-current",
        companyName: "Blue Sky Coffee Co.",
        location: "Columbus, OH",
        industry: "Specialty coffee roaster and cafe",
        contactPersonName: "Jordan Blake",
        email: "jordan@blueskycoffee.example",
        phone: "(614) 555-0148",
        preferredContactMethod: "Email",
        potentialProblems: "We need a cleaner, faster checkout for our online ordering site.",
        categories: ["Web Design", "UX Research"],
        approvalStatus: "approved",
        createdAt: new Date("2025-09-12"),
      },
      {
        userId: "dev-biz-past",
        businessId: "dev-biz-past",
        companyName: "Riverside Bike Shop",
        location: "Columbus, OH",
        industry: "Local bike shop",
        contactPersonName: "Sam Rivera",
        email: "sam@riversidebikes.example",
        phone: "(614) 555-0199",
        preferredContactMethod: "Email",
        potentialProblems: "We track sales in spreadsheets and want a simple dashboard.",
        categories: ["Data Analysis"],
        approvalStatus: "approved",
        createdAt: new Date("2025-11-02"),
      },
      {
        userId: "dev-biz-4",
        businessId: "dev-biz-4",
        companyName: "Corner Deli & Market",
        location: "Columbus, OH",
        industry: "Neighborhood deli",
        contactPersonName: "Sam Rivera",
        email: "sam@cornerdeli.example",
        phone: "(614) 555-0122",
        preferredContactMethod: "Email",
        potentialProblems: "We don't have a website yet.",
        categories: ["Web Design"],
        approvalStatus: "approved",
        createdAt: new Date("2026-02-20"),
      },
    ];
  }

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

// ============================================
// CONTRACT PDF MANAGEMENT
// ============================================

/**
 * Upload a contract PDF for a partnership assignment.
 * Stores the file in Firebase Storage and saves the download URL
 * in the assignment document.
 */
export const uploadContractPdf = async (
  opportunityId: string,
  studentId: string,
  file: File
): Promise<string> => {
  try {
    // Validate file type
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are allowed");
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `contracts/${opportunityId}_${studentId}.pdf`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // Update the assignment document with the PDF URL
    // Handle both general (business-level) and opportunity-level assignments
    if (opportunityId.startsWith("business-")) {
      const businessId = opportunityId.replace("business-", "");
      const assignmentRef = doc(db, "businesses", businessId, "assignedStudents", studentId);
      await updateDoc(assignmentRef, {
        contractPdfUrl: downloadUrl,
      });
    } else {
      const assignmentRef = doc(db, "opportunities", opportunityId, "assignedStudents", studentId);
      await updateDoc(assignmentRef, {
        contractPdfUrl: downloadUrl,
      });
    }

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading contract PDF:", error);
    throw error;
  }
};

// ============================================
// MIDPOINT MEETING TRACKING
// ============================================

/**
 * Set or update the midpoint meeting date / completion status for a partnership.
 * Handles both general (business-level) and opportunity-level assignments.
 */
export const setMidpointMeeting = async (
  opportunityId: string,
  studentId: string,
  updates: { date?: Date | null; completed?: boolean }
): Promise<void> => {
  if (devPreviewState.active) return;

  try {
    const payload: Record<string, Date | boolean | null> = {};
    if (updates.date !== undefined) payload.midpointMeetingDate = updates.date;
    if (updates.completed !== undefined) payload.midpointMeetingCompleted = updates.completed;

    if (opportunityId.startsWith("business-")) {
      const businessId = opportunityId.replace("business-", "");
      await updateDoc(doc(db, "businesses", businessId, "assignedStudents", studentId), payload);
    } else {
      await updateDoc(doc(db, "opportunities", opportunityId, "assignedStudents", studentId), payload);
    }
  } catch (error) {
    console.error("Error setting midpoint meeting:", error);
    throw error;
  }
};

/**
 * Get partnership assignments for a student that have contract PDFs.
 * Used by the student dashboard to display the "Current Partnership" tab.
 */
export const getStudentPartnershipAssignments = async (studentId: string): Promise<OpportunityAssignment[]> => {
  if (studentId === DEV_PREVIEW_UID) {
    return [
      {
        studentId,
        opportunityId: "dev-opp-current",
        businessId: "dev-biz-current",
        business: {
          businessId: "dev-biz-current",
          companyName: "Blue Sky Coffee Co.",
          location: "Columbus, OH",
          industry: "Specialty coffee roaster and cafe",
          contactPersonName: "Jordan Blake",
          email: "jordan@blueskycoffee.example",
          preferredContactMethod: "Email",
          potentialProblems: "We need a cleaner, faster checkout for our online ordering site.",
        },
        opportunity: {
          id: "dev-opp-current",
          businessId: "dev-biz-current",
          businessName: "Blue Sky Coffee Co.",
          title: "Redesign online ordering flow",
          description: "Audit the current checkout flow, propose wireframes, and help implement the redesign.",
          categories: ["Web Design", "UX Research"],
          status: "active",
          createdAt: new Date("2026-06-01"),
        },
        assignedAt: new Date("2026-06-20"),
        assignedBy: "admin",
        contractPdfUrl: "https://example.com/dev-preview-contract.pdf",
        midpointMeetingDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        midpointMeetingCompleted: false,
      },
      {
        studentId,
        opportunityId: "dev-opp-past",
        businessId: "dev-biz-past",
        business: {
          businessId: "dev-biz-past",
          companyName: "Riverside Bike Shop",
          location: "Columbus, OH",
          industry: "Local bike shop",
          contactPersonName: "Sam Rivera",
          email: "sam@riversidebikes.example",
          preferredContactMethod: "Email",
          potentialProblems: "We track sales in spreadsheets and want a simple dashboard.",
        },
        opportunity: {
          id: "dev-opp-past",
          businessId: "dev-biz-past",
          businessName: "Riverside Bike Shop",
          title: "Basic sales dashboard",
          description: "Built a lightweight dashboard to visualize monthly sales trends.",
          categories: ["Data Analysis"],
          status: "closed",
          createdAt: new Date("2025-12-01"),
        },
        assignedAt: new Date("2026-01-05"),
        assignedBy: "admin",
        applicationId: "dev-app-past",
        midpointMeetingDate: new Date("2026-01-20"),
        midpointMeetingCompleted: true,
      },
    ];
  }

  try {
    const assignments: OpportunityAssignment[] = [];

    // 1. Fetch opportunity-level assignments
    const allOpportunities = await getDocs(collection(db, "opportunities"));
    for (const oppDoc of allOpportunities.docs) {
      try {
        const assignmentDocRef = doc(db, "opportunities", oppDoc.id, "assignedStudents", studentId);
        const assignmentSnap = await getDoc(assignmentDocRef);

        if (assignmentSnap.exists()) {
          const assignmentData = assignmentSnap.data();
          const opportunity = { id: oppDoc.id, ...oppDoc.data() } as Opportunity;

          let businessData: PublicBusinessData | undefined;
          if (opportunity.businessId) {
            const businessDoc = await getDoc(doc(db, "businesses", opportunity.businessId));
            if (businessDoc.exists()) {
              businessData = { ...businessDoc.data(), businessId: businessDoc.id } as PublicBusinessData;
            }
          }

          assignments.push({
            studentId,
            opportunityId: oppDoc.id,
            businessId: assignmentData.businessId,
            opportunity,
            business: businessData,
            assignedAt: assignmentData.assignedAt,
            assignedBy: assignmentData.assignedBy,
            notes: assignmentData.notes,
            applicationId: assignmentData.applicationId,
            contractPdfUrl: assignmentData.contractPdfUrl,
          });
        }
      } catch (innerErr) {
        // Permission denied for this opportunity's assignment doc — skip it
      }
    }

    // 2. Fetch general (business-level) assignments
    const allBusinesses = await getDocs(collection(db, "businesses"));
    for (const businessDoc of allBusinesses.docs) {
      try {
        const assignmentDocRef = doc(db, "businesses", businessDoc.id, "assignedStudents", studentId);
        const assignmentSnap = await getDoc(assignmentDocRef);

        if (assignmentSnap.exists()) {
          const assignmentData = assignmentSnap.data();
          const businessData = { ...businessDoc.data(), businessId: businessDoc.id } as PublicBusinessData;

          assignments.push({
            studentId,
            opportunityId: `business-${businessDoc.id}`,
            businessId: businessDoc.id,
            opportunity: undefined,
            business: businessData,
            assignedAt: assignmentData.assignedAt,
            assignedBy: assignmentData.assignedBy,
            notes: assignmentData.notes,
            applicationId: assignmentData.applicationId,
            contractPdfUrl: assignmentData.contractPdfUrl,
          });
        }
      } catch (innerErr) {
        // Permission denied — skip
      }
    }

    // Sort by most recent first
    assignments.sort((a, b) => {
      const dateA = a.assignedAt?.toDate ? a.assignedAt.toDate() : new Date(a.assignedAt);
      const dateB = b.assignedAt?.toDate ? b.assignedAt.toDate() : new Date(b.assignedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return assignments;
  } catch (error) {
    console.error("Error fetching student partnership assignments:", error);
    throw error;
  }
};
