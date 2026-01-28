import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Application } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, FileText, Loader2, MessageSquare } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BusinessApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        // Query applications for this business
        const applicationsRef = collection(db, "applications");
        const q = query(applicationsRef, where("businessId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const apps: Application[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({
            id: doc.id,
            ...doc.data(),
          } as Application);
        });
        
        // Sort by applied date (newest first)
        apps.sort((a, b) => {
          const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
          const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setApplications(apps);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/business/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold font-heading">Applications</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {applications.length === 0 ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  No Applications Yet
                </CardTitle>
                <CardDescription>
                  Student applications will appear here once students start applying to your opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {applications.length} {applications.length === 1 ? "Application" : "Applications"}
                </h2>
              </div>
              
              {applications.map((application) => (
                <Card key={application.id} className="border-primary/20 hover:border-primary/40 transition-colors shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <User className="h-5 w-5 text-primary" />
                          {application.studentName || "Student"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Applied {application.appliedAt?.toDate 
                            ? new Date(application.appliedAt.toDate()).toLocaleDateString()
                            : new Date(application.appliedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground font-medium">{application.studentEmail}</span>
                    </div>

                    {application.answers && Object.keys(application.answers).length > 0 && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Application Answers
                          </h4>
                          {Object.entries(application.answers).map(([question, answer], index) => (
                            <div key={index} className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">{question}</p>
                              <p className="text-sm text-foreground whitespace-pre-wrap bg-secondary/50 p-3 rounded-md border border-primary/10">
                                {answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusinessApplications;
