import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  BusinessWithApprovalStatus,
  isAdmin,
  getAllOpportunityAssignments,
  OpportunityAssignment,
  getAllStudents,
  getApprovedBusinesses,
  assignStudentToOpportunity,
  removeStudentFromOpportunity,
  assignStudentToBusiness,
  StudentProfile,
  BusinessData,
  getAllActiveOpportunities,
  Opportunity
} from "@/lib/firestore";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/emailNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  LogOut,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
  Users,
  Calendar,
  Link2,
  Award,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessWithApprovalStatus[]>([]);
  const [assignments, setAssignments] = useState<OpportunityAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"approvals" | "partnerships">("approvals");

  // Assignment form state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (!isAdmin(currentUser.email)) {
        navigate("/");
      }
    }
  }, [authLoading, currentUser, navigate]);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      setError("");
      const businesses = await getPendingBusinesses();
      setPendingBusinesses(businesses);
    } catch (err) {
      console.error("Error fetching pending businesses:", err);
      setError("Failed to load pending businesses");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOpportunityAssignments();
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsBusinessesAndOpportunities = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, businessesData, opportunitiesData, assignmentsData] = await Promise.all([
        getAllStudents(),
        getApprovedBusinesses(),
        getAllActiveOpportunities(),
        getAllOpportunityAssignments(),
      ]);
      setStudents(studentsData);
      setBusinesses(businessesData);
      setOpportunities(opportunitiesData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedOpportunity) {
      setError("Please select both a student and an opportunity/business");
      return;
    }

    try {
      setIsAssigning(true);
      setError("");

      // Check if this is a business-level assignment (for backward compatibility)
      if (selectedOpportunity.startsWith("business-")) {
        const businessId = selectedOpportunity.replace("business-", "");
        await assignStudentToBusiness(
          businessId,
          selectedStudent,
          currentUser?.email || "admin",
          assignmentNotes
        );
      } else {
        // Opportunity-level assignment (new system)
        await assignStudentToOpportunity(
          selectedOpportunity,
          selectedStudent,
          undefined, // No application ID for manual assignments
          currentUser?.email || "admin",
          assignmentNotes
        );
      }

      // Reset form
      setSelectedStudent("");
      setSelectedOpportunity("");
      setAssignmentNotes("");

      // Refresh assignments
      await fetchStudentsBusinessesAndOpportunities();
    } catch (err) {
      console.error("Error assigning student:", err);
      setError("Failed to assign student");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (opportunityId: string, studentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      setError("");
      await removeStudentFromOpportunity(opportunityId, studentId);
      // Refresh assignments
      await fetchStudentsBusinessesAndOpportunities();
    } catch (err) {
      console.error("Error removing assignment:", err);
      setError("Failed to remove assignment");
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin(currentUser?.email)) {
      if (activeTab === "approvals") {
        fetchPendingBusinesses();
      } else {
        fetchStudentsBusinessesAndOpportunities();
      }
    }
  }, [authLoading, currentUser?.email, activeTab]);

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError("");

      // Find the business data
      const business = pendingBusinesses.find((b) => b.userId === userId);
      if (!business) {
        throw new Error("Business not found");
      }

      // Approve in database
      await approveBusiness(userId);

      // Send approval email notification
      await sendApprovalEmail({
        businessName: business.companyName,
        contactEmail: business.email,
        contactPersonName: business.contactPersonName,
      });

      // Remove from pending list
      setPendingBusinesses((prev) => prev.filter((b) => b.userId !== userId));

      console.log(`Approved business: ${userId}`);
    } catch (err) {
      console.error("Error approving business:", err);
      setError("Failed to approve business");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError("");

      // Find the business data
      const business = pendingBusinesses.find((b) => b.userId === userId);
      if (!business) {
        throw new Error("Business not found");
      }

      // Reject in database
      await rejectBusiness(userId);

      // Send rejection email notification
      await sendRejectionEmail({
        businessName: business.companyName,
        contactEmail: business.email,
        contactPersonName: business.contactPersonName,
      });

      // Remove from pending list
      setPendingBusinesses((prev) => prev.filter((b) => b.userId !== userId));

      console.log(`Rejected business: ${userId}`);
    } catch (err) {
      console.error("Error rejecting business:", err);
      setError("Failed to reject business");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-heading text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={activeTab === "approvals" ? fetchPendingBusinesses : fetchStudentsBusinessesAndOpportunities}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline">{currentUser?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container">
          <div className="flex gap-1 border-t border-primary/10">
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "approvals"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab("partnerships")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "partnerships"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Partnerships
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <>
              {/* Summary Card */}
              <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-primary" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Review and approve or reject business registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {pendingBusinesses.length} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pending Businesses List */}
          {pendingBusinesses.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  There are no pending business registrations at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingBusinesses.map((business) => (
                <Card key={business.userId} className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <Building2 className="h-5 w-5 text-primary" />
                          {business.companyName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Registration ID: {business.userId.substring(0, 8)}...
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Building2 className="h-4 w-4 text-primary" />
                          Company Name
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.companyName}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          Location
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.location}</p>
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Industry
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground">{business.industry}</p>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <User className="h-4 w-4 text-primary" />
                          Contact Person
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.contactPersonName}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </div>
                        <p className="text-sm text-foreground">{business.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone
                      </div>
                      <p className="text-sm text-foreground">{business.phone}</p>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Project Needs
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground">{business.potentialProblems}</p>
                    </div>

                    {business.categories && business.categories.length > 0 && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Categories
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {business.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {business.createdAt && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="text-xs text-muted-foreground">
                          Registered:{" "}
                          {business.createdAt?.toDate
                            ? new Date(business.createdAt.toDate()).toLocaleString()
                            : new Date(business.createdAt).toLocaleString()}
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-primary/20">
                      <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(business.userId)}
                        disabled={processingId === business.userId}
                      >
                        {processingId === business.userId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(business.userId)}
                        disabled={processingId === business.userId}
                      >
                        {processingId === business.userId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </>
          )}

          {/* Partnerships Tab */}
          {activeTab === "partnerships" && (
            <>
              {/* Summary Card */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    Opportunity Assignments
                  </CardTitle>
                  <CardDescription>
                    All student-opportunity assignments currently active
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {assignments.length} Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Interface */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    Assign Student to Any Opportunity
                  </CardTitle>
                  <CardDescription>
                    Match students to opportunities across all businesses (Business owner shown for each option)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900">
                      <strong>Admin Privilege:</strong> You can match students to any opportunity from any business.
                      Choose "General Assignment" for business-wide matching (legacy), or select a specific opportunity.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select Student */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Student</label>
                      <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.userId} value={student.userId}>
                              {student.name}{student.email ? ` - ${student.email}` : " (no email)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStudent && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {students.find(s => s.userId === selectedStudent)?.skills?.length || 0} skills
                        </div>
                      )}
                    </div>

                    {/* Select Opportunity (grouped by business) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Select Opportunity or Business
                      </label>
                      <Select value={selectedOpportunity || ""} onValueChange={setSelectedOpportunity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an opportunity or business..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {businesses.map((business) => {
                            const businessOpps = opportunities.filter(
                              opp => opp.businessId === business.userId && opp.status === "active"
                            );
                            return (
                              <SelectGroup key={business.userId}>
                                <SelectLabel className="text-primary font-semibold">
                                  {business.companyName}
                                </SelectLabel>
                                {/* General business-level assignment option */}
                                <SelectItem
                                  key={`business-${business.userId}`}
                                  value={`business-${business.userId}`}
                                  className="italic text-muted-foreground"
                                >
                                  → General Assignment (Business-wide)
                                </SelectItem>
                                {/* Specific opportunities */}
                                {businessOpps.map((opp) => (
                                  <SelectItem key={opp.id} value={opp.id!}>
                                    → {opp.title}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {selectedOpportunity && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedOpportunity.startsWith("business-") ? (
                            <span className="italic">
                              Legacy business-level assignment (not tied to specific opportunity)
                            </span>
                          ) : (
                            <span>
                              {opportunities.find(o => o.id === selectedOpportunity)?.description?.substring(0, 80)}
                              {opportunities.find(o => o.id === selectedOpportunity)?.description &&
                               opportunities.find(o => o.id === selectedOpportunity)!.description.length > 80 && "..."}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                    <Textarea
                      placeholder="Add any notes about this assignment..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Assign Button */}
                  <Button
                    onClick={handleAssignStudent}
                    disabled={!selectedStudent || !selectedOpportunity || isAssigning}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Assignments Grid */}
              {assignments.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No assignments yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Assign students to opportunities to create matches
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignments.map((assignment, index) => (
                    <Card key={`${assignment.opportunityId}-${assignment.studentId}-${index}`} className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground mb-2">
                              <Link2 className="h-5 w-5 text-primary" />
                              Assignment
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {assignment.assignedAt?.toDate
                                ? new Date(assignment.assignedAt.toDate()).toLocaleDateString()
                                : new Date(assignment.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        {/* Student Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <User className="h-4 w-4" />
                            Student
                          </div>
                          <div className="pl-6 space-y-1">
                            <p className="font-medium text-foreground">
                              {assignment.student?.name || "Unknown Student"}
                            </p>
                            {assignment.student?.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {assignment.student.email}
                              </p>
                            )}
                            {assignment.student?.skills && assignment.student.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {assignment.student.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {skill}
                                  </Badge>
                                ))}
                                {assignment.student.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{assignment.student.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Opportunity Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Briefcase className="h-4 w-4" />
                            Opportunity
                          </div>
                          <div className="pl-6 space-y-1">
                            <p className="font-medium text-foreground">
                              {assignment.opportunity?.title || "Unknown Opportunity"}
                            </p>
                            {assignment.opportunity?.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {assignment.opportunity.description}
                              </p>
                            )}
                            {assignment.opportunity?.categories && assignment.opportunity.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {assignment.opportunity.categories.slice(0, 2).map((category) => (
                                  <Badge key={category} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {category}
                                  </Badge>
                                ))}
                                {assignment.opportunity.categories.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{assignment.opportunity.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Business Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            Business
                          </div>
                          <div className="pl-6 space-y-1">
                            <p className="text-sm text-foreground">
                              {assignment.business?.companyName || "Unknown Business"}
                            </p>
                            {assignment.business?.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {assignment.business.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {assignment.notes && (
                          <>
                            <Separator className="bg-primary/20" />
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                              <p className="text-sm text-foreground pl-2 border-l-2 border-primary/20">
                                {assignment.notes}
                              </p>
                            </div>
                          </>
                        )}

                        {assignment.assignedBy && (
                          <div className="text-xs text-muted-foreground pt-2 border-t border-primary/10">
                            Assigned by: {assignment.assignedBy}
                          </div>
                        )}

                        {/* Remove Assignment Button */}
                        <div className="pt-4 border-t border-primary/10">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemoveAssignment(assignment.opportunityId, assignment.studentId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Assignment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
