import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Application, markApplicationCompleted, acceptApplication, rejectApplication, Opportunity, getOpportunitiesForBusiness } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Mail, FileText, Loader2, MessageSquare, CheckCircle, Star, Eye, ThumbsUp, X, Filter } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RatingDialog from "@/components/RatingDialog";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import Disclaimer from "@/components/Disclaimer";
import { toast } from "sonner";

const BusinessApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);

        // Fetch opportunities for this business
        const opps = await getOpportunitiesForBusiness(currentUser.uid);
        setOpportunities(opps);

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

        // Check if opportunityId is in URL params and set it
        const opportunityIdParam = searchParams.get("opportunityId");
        if (opportunityIdParam) {
          setSelectedOpportunityId(opportunityIdParam);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.uid, searchParams]);

  const handleAcceptApplication = async (application: Application) => {
    if (!application.id) return;

    console.log("🎯 Accepting application:", application.id);
    console.log("Student ID:", application.studentId);
    console.log("Business ID:", application.businessId);

    try {
      await acceptApplication(application.id);
      console.log("✅ Application accepted successfully");
      toast.success("Application accepted! Student will appear in Assigned Students.");

      // Refresh applications
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "accepted" } : app
        )
      );
    } catch (error) {
      console.error("❌ Error accepting application:", error);
      toast.error(`Failed to accept application: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleRejectApplication = async (application: Application) => {
    if (!application.id) return;

    if (!confirm("Are you sure you want to reject this application? This action cannot be undone.")) {
      return;
    }

    try {
      await rejectApplication(application.id);
      toast.success("Application rejected");

      // Refresh applications
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "rejected" } : app
        )
      );
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  const handleMarkCompleted = async (application: Application) => {
    if (!application.id) return;

    try {
      await markApplicationCompleted(application.id);
      toast.success("Project marked as completed!");

      // Refresh applications
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "completed" } : app
        )
      );
    } catch (error) {
      toast.error("Failed to mark project as completed");
    }
  };

  const handleOpenRating = (application: Application) => {
    setSelectedApplication(application);
    setRatingDialogOpen(true);
  };

  const handleViewStudent = (application: Application) => {
    setSelectedApplication(application);
    setStudentDetailsOpen(true);
  };

  const handleRatingSuccess = () => {
    // Refresh applications to update status
    if (currentUser?.uid) {
      const fetchApplications = async () => {
        try {
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

          apps.sort((a, b) => {
            const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
            const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
            return dateB.getTime() - dateA.getTime();
          });

          setApplications(apps);
        } catch (error) {
        }
      };

      fetchApplications();
    }
  };

  // Filter applications based on selected opportunity
  const displayedApplications = selectedOpportunityId === "all"
    ? applications
    : selectedOpportunityId === "legacy"
    ? applications.filter(app => !app.opportunityId)
    : applications.filter(app => app.opportunityId === selectedOpportunityId);

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
        <div className="max-w-4xl mx-auto mb-6">
          <Disclaimer />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Opportunity Filter */}
          {opportunities.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Filter Applications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Filter by Opportunity</Label>
                  <Select value={selectedOpportunityId} onValueChange={setSelectedOpportunityId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Opportunities ({applications.length})</SelectItem>
                      {opportunities.map(opp => (
                        <SelectItem key={opp.id} value={opp.id!}>
                          {opp.title} ({applications.filter(app => app.opportunityId === opp.id).length} applications)
                        </SelectItem>
                      ))}
                      <SelectItem value="legacy">
                        Legacy Applications (no opportunity) ({applications.filter(app => !app.opportunityId).length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {displayedApplications.length === 0 ? (
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
                  {displayedApplications.length} {displayedApplications.length === 1 ? "Application" : "Applications"}
                </h2>
              </div>

              {displayedApplications.map((application) => (
                <Card key={application.id} className="border-primary/20 hover:border-primary/40 transition-colors shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="flex items-center gap-2 text-foreground">
                            <User className="h-5 w-5 text-primary" />
                            {application.studentName || "Student"}
                          </CardTitle>
                          {(application as any).status === "accepted" && (
                            <Badge variant="secondary" className="bg-green-600/10 text-green-700 border-green-600/20">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                          {(application as any).status === "completed" && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {(application as any).status === "rated" && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              Rated
                            </Badge>
                          )}
                          {(application as any).status === "rejected" && (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                              <X className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {(!((application as any).status) || (application as any).status === "pending") && (
                            <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-700">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {application.opportunityTitle && (
                            <div className="text-sm font-medium text-foreground mb-1">
                              For: {application.opportunityTitle}
                            </div>
                          )}
                          Applied {application.appliedAt?.toDate
                            ? new Date(application.appliedAt.toDate()).toLocaleDateString()
                            : new Date(application.appliedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground font-medium">{application.studentEmail}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Student Profile
                      </Button>
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

                    <Separator className="bg-primary/20" />

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                      {(!((application as any).status) || (application as any).status === "pending") && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectApplication(application)}
                            className="border-destructive/20 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptApplication(application)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Accept Application
                          </Button>
                        </>
                      )}

                      {(application as any).status === "accepted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkCompleted(application)}
                          className="border-blue-500/20 text-blue-700 hover:bg-blue-500/10"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      )}

                      {(application as any).status === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenRating(application)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Rate Student
                        </Button>
                      )}

                      {(application as any).status === "rated" && (
                        <p className="text-sm text-muted-foreground">
                          Rating submitted
                        </p>
                      )}

                      {(application as any).status === "rejected" && (
                        <p className="text-sm text-muted-foreground">
                          Application rejected
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Rating Dialog */}
      {selectedApplication && (
        <>
          <RatingDialog
            open={ratingDialogOpen}
            onOpenChange={setRatingDialogOpen}
            applicationId={selectedApplication.id || ""}
            studentId={selectedApplication.studentId}
            studentName={selectedApplication.studentName || selectedApplication.studentEmail}
            businessId={currentUser?.uid || ""}
            onSuccess={handleRatingSuccess}
          />

          <StudentDetailsDialog
            open={studentDetailsOpen}
            onOpenChange={setStudentDetailsOpen}
            studentId={selectedApplication.studentId}
            studentEmail={selectedApplication.studentEmail}
            studentName={selectedApplication.studentName || selectedApplication.studentEmail}
          />
        </>
      )}
    </div>
  );
};

export default BusinessApplications;
