import type { User } from "firebase/auth";
import { AuthContext } from "@/contexts/AuthContext";
import { devPreviewState } from "@/lib/firestore";
import StudentDashboard from "./StudentDashboard";
import BusinessDashboard from "./BusinessDashboard";

/**
 * Dev-only: renders the logged-in dashboards with a fake session so they can be
 * styled/reviewed without real Firebase credentials. Only mounted when
 * import.meta.env.DEV is true (see routes in App.tsx) — excluded from prod builds.
 */

const mockUser = {
  uid: "dev-preview-uid",
  email: "preview@example.com",
  metadata: { creationTime: new Date().toISOString() },
} as unknown as User;

const mockAuthValue = {
  currentUser: mockUser,
  loading: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
};

export const DevStudentDashboardPreview = () => {
  devPreviewState.active = true;
  return (
    <AuthContext.Provider value={mockAuthValue}>
      <StudentDashboard />
    </AuthContext.Provider>
  );
};

export const DevBusinessDashboardPreview = () => {
  devPreviewState.active = true;
  return (
    <AuthContext.Provider value={mockAuthValue}>
      <BusinessDashboard />
    </AuthContext.Provider>
  );
};
