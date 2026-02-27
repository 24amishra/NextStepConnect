import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  BusinessWithApprovalStatus,
  isAdmin,
  getAllPartnerships,
  Partnership,
  getAllStudents,
  getApprovedBusinesses,
  assignStudentToBusiness,
  removeStudentAssignment,
  StudentProfile,
  BusinessData
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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessWithApprovalStatus[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"approvals" | "partnerships">("approvals");

  // Assignment form state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
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

  const fetchPartnerships = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPartnerships();
      setPartnerships(data);
    } catch (err) {
      console.error("Error fetching partnerships:", err);
      setError("Failed to load partnerships");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndBusinesses = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, businessesData, partnershipsData] = await Promise.all([
        getAllStudents(),
        getApprovedBusinesses(),
        getAllPartnerships(),
      ]);
      setStudents(studentsData);
      setBusinesses(businessesData);
      setPartnerships(partnershipsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedBusiness) {
      setError("Please select both a student and a business");
      return;
    }

    try {
      setIsAssigning(true);
      setError("");
      await assignStudentToBusiness(
        selectedBusiness,
        selectedStudent,
        currentUser?.email || "admin",
        assignmentNotes
      );

      // Reset form
      setSelectedStudent("");
      setSelectedBusiness("");
      setAssignmentNotes("");

      // Refresh partnerships
      await fetchStudentsAndBusinesses();
    } catch (err) {
      console.error("Error assigning student:", err);
      setError("Failed to assign student to business");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemovePartnership = async (businessId: string, studentId: string) => {
    if (!confirm("Are you sure you want to remove this partnership?")) {
      return;
    }

    try {
      setError("");
      await removeStudentAssignment(businessId, studentId);
      // Refresh partnerships
      await fetchStudentsAndBusinesses();
    } catch (err) {
      console.error("Error removing partnership:", err);
      setError("Failed to remove partnership");
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin(currentUser?.email)) {
      if (activeTab === "approvals") {
        fetchPendingBusinesses();
      } else {
        fetchStudentsAndBusinesses();
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
              onClick={activeTab === "approvals" ? fetchPendingBusinesses : fetchStudentsAndBusinesses}
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
                    Active Partnerships
                  </CardTitle>
                  <CardDescription>
                    All student-business partnerships currently active
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {partnerships.length} Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Interface */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    Assign Student to Business
                  </CardTitle>
                  <CardDescription>
                    Create a new partnership by assigning a student to an approved business
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select Student */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Student</label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
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

                    {/* Select Business */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Business</label>
                      <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a business..." />
                        </SelectTrigger>
                        <SelectContent>
                          {businesses.map((business) => (
                            <SelectItem key={business.userId} value={business.userId}>
                              {business.companyName} - {business.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedBusiness && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {businesses.find(b => b.userId === selectedBusiness)?.industry}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                    <Textarea
                      placeholder="Add any notes about this partnership..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Assign Button */}
                  <Button
                    onClick={handleAssignStudent}
                    disabled={!selectedStudent || !selectedBusiness || isAssigning}
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
                        Create Partnership
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

              {/* Partnerships Grid */}
              {partnerships.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No partnerships yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Assign students to businesses to create partnerships
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partnerships.map((partnership, index) => (
                    <Card key={`${partnership.businessId}-${partnership.studentId}-${index}`} className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground mb-2">
                              <Link2 className="h-5 w-5 text-primary" />
                              Partnership
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {partnership.assignedAt?.toDate
                                ? new Date(partnership.assignedAt.toDate()).toLocaleDateString()
                                : new Date(partnership.assignedAt).toLocaleDateString()}
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
                              {partnership.student?.name || "Unknown Student"}
                            </p>
                            {partnership.student?.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {partnership.student.email}
                              </p>
                            )}
                            {partnership.student?.skills && partnership.student.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {partnership.student.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {skill}
                                  </Badge>
                                ))}
                                {partnership.student.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{partnership.student.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Business Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Building2 className="h-4 w-4" />
                            Business
                          </div>
                          <div className="pl-6 space-y-1">
                            <p className="font-medium text-foreground">
                              {partnership.business?.companyName || "Unknown Business"}
                            </p>
                            {partnership.business?.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {partnership.business.location}
                              </p>
                            )}
                            {partnership.business?.categories && partnership.business.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {partnership.business.categories.slice(0, 2).map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs border-primary/30">
                                    {category}
                                  </Badge>
                                ))}
                                {partnership.business.categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{partnership.business.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {partnership.notes && (
                          <>
                            <Separator className="bg-primary/20" />
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                              <p className="text-sm text-foreground pl-2 border-l-2 border-primary/20">
                                {partnership.notes}
                              </p>
                            </div>
                          </>
                        )}

                        {partnership.assignedBy && (
                          <div className="text-xs text-muted-foreground pt-2 border-t border-primary/10">
                            Assigned by: {partnership.assignedBy}
                          </div>
                        )}

                        {/* Remove Partnership Button */}
                        <div className="pt-4 border-t border-primary/10">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemovePartnership(partnership.businessId, partnership.studentId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Partnership
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
