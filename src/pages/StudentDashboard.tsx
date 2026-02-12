import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Mail, Calendar, Briefcase, BookOpen, Star } from "lucide-react";
import JobPostingsList from "@/components/JobPostingsList";
import EducationalResources from "@/components/EducationalResources";
import Disclaimer from "@/components/Disclaimer";
import StudentRatings from "@/components/StudentRatings";

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
        <div className="mb-6">
          <Disclaimer />
        </div>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="opportunities" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile & Ratings</span>
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <JobPostingsList />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <EducationalResources />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
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

            {/* Ratings */}
            <StudentRatings />

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Profile Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>LinkedIn:</strong> Keep your profile updated with your latest projects and skills
                </p>
                <p>
                  <strong>Portfolio:</strong> Create a portfolio website to showcase your best work
                </p>
                <p>
                  <strong>Headshot:</strong> Use a professional photo on all your profiles
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
