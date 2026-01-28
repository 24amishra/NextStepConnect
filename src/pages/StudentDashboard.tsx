import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Calendar } from "lucide-react";
import JobPostingsList from "@/components/JobPostingsList";

const StudentDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading text-foreground">Student Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline">{currentUser?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>Your student profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </div>
                <p className="text-lg font-semibold text-foreground">{currentUser?.email}</p>
              </div>

              {currentUser?.metadata.creationTime && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Account Created
                  </div>
                  <p className="text-base text-foreground">
                    {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  User ID
                </div>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {currentUser?.uid}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Postings List */}
          <JobPostingsList />

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Welcome to NextStep!</CardTitle>
              <CardDescription>
                Your student account is set up and ready to go.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse available opportunities above and apply to positions that match your interests and skills.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
