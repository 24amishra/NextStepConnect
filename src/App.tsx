import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessLogin from "./pages/BusinessLogin";
import StudentLogin from "./pages/StudentLogin";
import BusinessSignup from "./pages/BusinessSignup";
import StudentSignup from "./pages/StudentSignup";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessApplications from "./pages/BusinessApplications";
import StudentDashboard from "./pages/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/business/login" element={<BusinessLogin />} />
            <Route path="/business/signup" element={<BusinessSignup />} />
            <Route
              path="/business/dashboard"
              element={
                <ProtectedRoute>
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business/applications"
              element={
                <ProtectedRoute>
                  <BusinessApplications />
                </ProtectedRoute>
              }
            />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
