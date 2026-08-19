import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/images/NextStepLogo.png";
import {
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  BusinessWithApprovalStatus,
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
  Opportunity,
  Application,
  getAllPendingInterests,
  dismissInterest,
  uploadContractPdf,
  getStudentsSeekingMatch,
  cancelMatchingRequest,
  getAllPosts,
  createPost,
  deletePost,
  Post,
  setMidpointMeeting,
  updateBusinessData,
  updateStudentProfile,
} from "@/lib/firestore";
import { StatusBoard, PartnershipStatus, partnershipStatusMeta } from "@/components/admin/StatusBoard";
import BusinessDetailModal from "@/components/admin/BusinessDetailModal";
import StudentDetailModal from "@/components/admin/StudentDetailModal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendApprovalEmail, sendRejectionEmail, sendMatchEmail } from "@/lib/emailNotifications";
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
  Heart,
  FileText,
  Upload,
  Handshake,
  Tags,
  Sparkles,
  Search,
  CalendarClock,
  AlarmClock,
  LayoutGrid,
  List as ListIcon,
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type MidpointStatus = "overdue" | "soon" | "unscheduled" | "scheduled" | "completed";

const midpointStatusOrder: Record<MidpointStatus, number> = {
  overdue: 0,
  soon: 1,
  unscheduled: 2,
  scheduled: 3,
  completed: 4,
};

const midpointStatusMeta: Record<MidpointStatus, { label: string; dot: string; badge: string }> = {
  overdue: { label: "Overdue", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  soon: { label: "This week", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  unscheduled: { label: "Needs a date", dot: "bg-slate-300", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  scheduled: { label: "Scheduled", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Done", dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200" },
};

const getMidpointStatus = (assignment: OpportunityAssignment): MidpointStatus => {
  if (assignment.midpointMeetingCompleted) return "completed";
  if (!assignment.midpointMeetingDate) return "unscheduled";
  const date = assignment.midpointMeetingDate?.toDate
    ? assignment.midpointMeetingDate.toDate()
    : new Date(assignment.midpointMeetingDate);
  const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 7) return "soon";
  return "scheduled";
};

const toDateInputValue = (value: Date | any): string => {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatMidpointDate = (value: Date | any): string => {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const toMillis = (value: Date | any): number => {
  if (!value) return 0;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatRelativeDate = (value: Date | any): string => {
  const millis = toMillis(value);
  if (!millis) return "";
  const days = Math.floor((Date.now() - millis) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

const getBusinessStatus = (business: BusinessData, assignments: OpportunityAssignment[]): PartnershipStatus => {
  const isAssigned = assignments.some((a) => a.businessId === business.userId);
  if (isAssigned) return "assigned";
  if (business.onHold) return "on_hold";
  return "unassigned";
};

const getStudentStatus = (student: StudentProfile, assignments: OpportunityAssignment[]): PartnershipStatus => {
  const isAssigned = assignments.some((a) => a.studentId === student.userId);
  if (isAssigned) return "assigned";
  if (student.onHold) return "on_hold";
  return "unassigned";
};

const AdminDashboard = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessWithApprovalStatus[]>([]);
  const [assignments, setAssignments] = useState<OpportunityAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"approvals" | "interests" | "matchRequests" | "partnerships" | "feed">("partnerships");
  const [interests, setInterests] = useState<Application[]>([]);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [matchRequests, setMatchRequests] = useState<StudentProfile[]>([]);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCaption, setPostCaption] = useState("");
  const [postBusinessName, setPostBusinessName] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Assignment form state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [uploadingPdfFor, setUploadingPdfFor] = useState<string | null>(null);
  const [savingMidpointFor, setSavingMidpointFor] = useState<string | null>(null);
  const [businessSearch, setBusinessSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [businessViewMode, setBusinessViewMode] = useState<"list" | "board">("list");
  const [studentViewMode, setStudentViewMode] = useState<"list" | "board">("list");
  const [businessSort, setBusinessSort] = useState<"newest" | "oldest" | "name" | "industry">("newest");
  const [studentSort, setStudentSort] = useState<"newest" | "oldest" | "name" | "skills">("newest");
  const [studentSkillFilter, setStudentSkillFilter] = useState<string[]>([]);
  const [selectedBusinessProfile, setSelectedBusinessProfile] = useState<BusinessData | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfile | null>(null);
  const [togglingOnHoldId, setTogglingOnHoldId] = useState<string | null>(null);

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

  const fetchInterests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPendingInterests();
      // Sort by most recent first
      data.sort((a, b) => {
        const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
        const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
        return dateB.getTime() - dateA.getTime();
      });
      setInterests(data);
    } catch (err) {
      console.error("Error fetching interests:", err);
      setError("Failed to load interests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudentsSeekingMatch();
      data.sort((a, b) => {
        const dateA = a.matchingRequestedAt?.toDate ? a.matchingRequestedAt.toDate() : new Date(a.matchingRequestedAt || 0);
        const dateB = b.matchingRequestedAt?.toDate ? b.matchingRequestedAt.toDate() : new Date(b.matchingRequestedAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setMatchRequests(data);
    } catch (err) {
      console.error("Error fetching match requests:", err);
      setError("Failed to load match requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissMatchRequest = async (studentId: string) => {
    try {
      setProcessingMatchId(studentId);
      await cancelMatchingRequest(studentId);
      setMatchRequests((prev) => prev.filter((s) => s.userId !== studentId));
    } catch (err) {
      console.error("Error dismissing match request:", err);
      setError("Failed to dismiss match request");
    } finally {
      setProcessingMatchId(null);
    }
  };

  const handleStartAssignFromMatchRequest = (studentId: string) => {
    setSelectedStudent(studentId);
    fetchStudentsBusinessesAndOpportunities();
    document.getElementById("assign-partnership-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postCaption.trim()) {
      setError("Write a caption before posting");
      return;
    }
    try {
      setSubmittingPost(true);
      setError("");
      await createPost({
        authorEmail: currentUser?.email || "admin",
        caption: postCaption.trim(),
        businessName: postBusinessName.trim() || undefined,
        category: postCategory.trim() || undefined,
      });
      setPostCaption("");
      setPostBusinessName("");
      setPostCategory("");
      await fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to publish post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post from the feed?")) return;
    try {
      setDeletingPostId(postId);
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post");
    } finally {
      setDeletingPostId(null);
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

      // Resolve the company name for the notification email
      let companyName = "a business";
      if (selectedOpportunity.startsWith("business-")) {
        const businessId = selectedOpportunity.replace("business-", "");
        companyName = businesses.find(b => b.userId === businessId)?.companyName || companyName;
        await assignStudentToBusiness(
          businessId,
          selectedStudent,
          currentUser?.email || "admin",
          assignmentNotes
        );
      } else {
        const opp = opportunities.find(o => o.id === selectedOpportunity);
        companyName = opp?.businessName || companyName;
        await assignStudentToOpportunity(
          selectedOpportunity,
          selectedStudent,
          undefined, // No application ID for manual assignments
          currentUser?.email || "admin",
          assignmentNotes
        );
      }

      // Send match notification email to the student (fire-and-forget)
      const student = students.find(s => s.userId === selectedStudent);
      if (student?.email) {
        sendMatchEmail({
          studentEmail: student.email,
          studentName: student.name,
          companyName,
        }).catch(console.error);
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

  const handlePdfUpload = async (opportunityId: string, studentId: string, file: File) => {
    const key = `${opportunityId}-${studentId}`;
    try {
      setUploadingPdfFor(key);
      setError("");
      await uploadContractPdf(opportunityId, studentId, file);
      // Refresh assignments to show the uploaded PDF
      await fetchStudentsBusinessesAndOpportunities();
    } catch (err) {
      console.error("Error uploading contract PDF:", err);
      setError("Failed to upload contract PDF. Make sure it's a valid PDF file.");
    } finally {
      setUploadingPdfFor(null);
    }
  };

  const handleSetMidpointDate = async (opportunityId: string, studentId: string, value: string) => {
    const key = `${opportunityId}-${studentId}`;
    try {
      setSavingMidpointFor(key);
      setError("");
      const date = value ? new Date(`${value}T12:00:00`) : null;
      await setMidpointMeeting(opportunityId, studentId, { date });
      await fetchStudentsBusinessesAndOpportunities();
    } catch (err) {
      console.error("Error setting midpoint meeting date:", err);
      setError("Failed to save the midpoint meeting date");
    } finally {
      setSavingMidpointFor(null);
    }
  };

  const handleToggleMidpointCompleted = async (opportunityId: string, studentId: string, completed: boolean) => {
    const key = `${opportunityId}-${studentId}`;
    try {
      setSavingMidpointFor(key);
      setError("");
      await setMidpointMeeting(opportunityId, studentId, { completed });
      await fetchStudentsBusinessesAndOpportunities();
    } catch (err) {
      console.error("Error updating midpoint meeting status:", err);
      setError("Failed to update the midpoint meeting");
    } finally {
      setSavingMidpointFor(null);
    }
  };

  const handleAssignFromInterest = async (interest: Application) => {
    if (!interest.id || !interest.opportunityId) return;

    try {
      setDismissingId(interest.id);
      setError("");

      // Assign student to the opportunity
      await assignStudentToOpportunity(
        interest.opportunityId,
        interest.studentId,
        interest.id,
        currentUser?.email || "admin",
        `Assigned from interest on ${new Date().toLocaleDateString()}`
      );

      // Update interest status to accepted
      await updateDoc(doc(db, "applications", interest.id), {
        status: "accepted",
        acceptedAt: new Date(),
      });

      // Send match notification email
      sendMatchEmail({
        studentEmail: interest.studentEmail,
        studentName: interest.studentName,
        companyName: interest.businessName,
      }).catch(console.error);

      // Refresh
      await fetchInterests();
    } catch (err) {
      console.error("Error assigning from interest:", err);
      setError("Failed to assign student");
    } finally {
      setDismissingId(null);
    }
  };

  const handleDismissInterest = async (id: string) => {
    try {
      setDismissingId(id);
      setError("");
      await dismissInterest(id, currentUser?.email || "admin");
      await fetchInterests();
    } catch (err) {
      console.error("Error dismissing interest:", err);
      setError("Failed to dismiss interest");
    } finally {
      setDismissingId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (activeTab === "approvals") {
        fetchPendingBusinesses();
      } else if (activeTab === "interests") {
        fetchInterests();
      } else if (activeTab === "matchRequests") {
        fetchMatchRequests();
      } else if (activeTab === "feed") {
        fetchPosts();
      } else {
        fetchStudentsBusinessesAndOpportunities();
      }
    }
  }, [authLoading, currentUser, activeTab]);

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

  const navItems = [
    { key: "partnerships" as const, label: "Partnerships", icon: Users },
    { key: "matchRequests" as const, label: "Match Requests", icon: Handshake, badge: matchRequests.length },
    { key: "interests" as const, label: "Interest Requests", icon: Heart },
    { key: "approvals" as const, label: "Pending Approvals", icon: AlertCircle },
    { key: "feed" as const, label: "Feed", icon: Sparkles },
  ];

  const refreshCurrentTab =
    activeTab === "approvals"
      ? fetchPendingBusinesses
      : activeTab === "interests"
      ? fetchInterests
      : activeTab === "matchRequests"
      ? fetchMatchRequests
      : activeTab === "feed"
      ? fetchPosts
      : fetchStudentsBusinessesAndOpportunities;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-nextstep-brick text-white flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <img src={logo} alt="NextStep" className="h-8 w-auto rounded" />
          <div>
            <p className="font-bold font-heading text-white leading-tight">Admin</p>
            <p className="text-[11px] text-white/50 leading-tight">Control panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {!!item.badge && (
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/20">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <p className="px-3 text-xs text-white/50 truncate">{currentUser?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold font-heading text-foreground">
              {navItems.find((item) => item.key === activeTab)?.label}
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={refreshCurrentTab} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
        <div className="max-w-6xl space-y-6">
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

          {/* Interests Tab */}
          {activeTab === "interests" && (
            <>
              {/* Summary Card */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Heart className="h-5 w-5 text-primary" />
                    Interest Requests
                  </CardTitle>
                  <CardDescription>
                    Review student interest submissions and assign them to opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {interests.length} Pending
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

              {/* Interest Cards */}
              {interests.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No pending interests</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Student interest requests will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {interests.map((interest) => (
                    <Card key={interest.id} className="border-primary/20 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <User className="h-5 w-5 text-primary" />
                              {interest.studentName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              <Mail className="h-3 w-3 inline mr-1" />
                              {interest.studentEmail}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        {/* Opportunity Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Briefcase className="h-4 w-4 text-primary" />
                            Opportunity
                          </div>
                          <p className="text-base font-semibold text-foreground">
                            {interest.opportunityTitle || "General Interest"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3 inline mr-1" />
                            {interest.businessName}
                          </p>
                        </div>

                        {/* Custom Question Answers */}
                        {interest.answers && Object.keys(interest.answers).length > 0 && (
                          <>
                            <Separator className="bg-primary/20" />
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                Responses
                              </div>
                              {Object.entries(interest.answers).map(([question, answer]) => (
                                <div key={question} className="bg-muted/30 p-3 rounded-lg space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">{question}</p>
                                  <p className="text-sm text-foreground">{answer}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        <Separator className="bg-primary/20" />

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {interest.appliedAt?.toDate
                            ? new Date(interest.appliedAt.toDate()).toLocaleDateString()
                            : new Date(interest.appliedAt).toLocaleDateString()}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-primary/20">
                          <Button
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAssignFromInterest(interest)}
                            disabled={dismissingId === interest.id}
                          >
                            {dismissingId === interest.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Assign
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleDismissInterest(interest.id!)}
                            disabled={dismissingId === interest.id}
                          >
                            {dismissingId === interest.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Dismiss
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

          {/* Match Requests Tab */}
          {activeTab === "matchRequests" && (
            <>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Handshake className="h-5 w-5 text-primary" />
                    Match Requests
                  </CardTitle>
                  <CardDescription>
                    Students who've asked to be paired with a business — pick one and assign them a partnership
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {matchRequests.length} Waiting
                  </Badge>
                </CardContent>
              </Card>

              {/* Assignment Interface */}
              <Card id="assign-partnership-form" className="border-primary/20 shadow-lg">
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
                    </div>
                  </div>

                  {/* Selected Student Detail Panel */}
                  {selectedStudent && (() => {
                    const student = students.find(s => s.userId === selectedStudent);
                    if (!student) return null;
                    return (
                      <div className="border-2 border-blue-200 bg-blue-50/50 rounded-lg p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                          <User className="h-4 w-4" />
                          Student Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm font-semibold text-foreground">{student.name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 text-primary" />
                              {student.email}
                            </p>
                          </div>
                          {student.linkedinUrl && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">LinkedIn</p>
                              <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {student.linkedinUrl}
                              </a>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Open to Matching</p>
                            <p className="text-sm font-semibold text-foreground">{student.openToMatching !== false ? "Yes" : "No"}</p>
                          </div>
                        </div>
                        {student.bio && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Bio</p>
                            <p className="text-sm text-foreground bg-white/60 p-3 rounded-md">{student.bio}</p>
                          </div>
                        )}
                        {student.skills && student.skills.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {student.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {student.desiredRoles && student.desiredRoles.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Desired Roles</p>
                            <div className="flex flex-wrap gap-1">
                              {student.desiredRoles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs border-primary/30 text-foreground">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Selected Business/Opportunity Detail Panel */}
                  {selectedOpportunity && (() => {
                    const isBusinessLevel = selectedOpportunity.startsWith("business-");
                    const businessId = isBusinessLevel
                      ? selectedOpportunity.replace("business-", "")
                      : opportunities.find(o => o.id === selectedOpportunity)?.businessId;
                    const business = businesses.find(b => b.userId === businessId);
                    const opportunity = !isBusinessLevel ? opportunities.find(o => o.id === selectedOpportunity) : null;

                    if (!business) return null;
                    return (
                      <div className="border-2 border-green-200 bg-green-50/50 rounded-lg p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                          <Building2 className="h-4 w-4" />
                          Business Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Company Name</p>
                            <p className="text-sm font-semibold text-foreground">{business.companyName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm font-semibold text-foreground">{business.industry}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary" />
                              {business.location}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Contact Person</p>
                            <p className="text-sm font-semibold text-foreground">{business.contactPersonName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 text-primary" />
                              {business.email}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 text-primary" />
                              {business.phone}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Preferred Contact</p>
                            <p className="text-sm font-semibold text-foreground">{business.preferredContactMethod}</p>
                          </div>
                        </div>
                        {business.potentialProblems && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Project Needs</p>
                            <p className="text-sm text-foreground bg-white/60 p-3 rounded-md whitespace-pre-wrap">{business.potentialProblems}</p>
                          </div>
                        )}
                        {business.categories && business.categories.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Categories</p>
                            <div className="flex flex-wrap gap-1">
                              {business.categories.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Opportunity details if a specific one is selected */}
                        {opportunity && (
                          <>
                            <Separator className="bg-green-200" />
                            <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                              <Briefcase className="h-4 w-4" />
                              Opportunity Details
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Title</p>
                                <p className="text-sm font-semibold text-foreground">{opportunity.title}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Badge variant="secondary" className="text-xs">{opportunity.status}</Badge>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Description</p>
                              <p className="text-sm text-foreground bg-white/60 p-3 rounded-md whitespace-pre-wrap">{opportunity.description}</p>
                            </div>
                            {opportunity.categories && opportunity.categories.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Opportunity Categories</p>
                                <div className="flex flex-wrap gap-1">
                                  {opportunity.categories.map((cat) => (
                                    <Badge key={cat} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {opportunity.applicationCount !== undefined && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Interest Count</p>
                                <p className="text-sm font-semibold text-foreground">{opportunity.applicationCount}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}

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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : matchRequests.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No one's waiting right now</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Students who tap "+" on their dashboard to request a partnership will show up here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {matchRequests.map((student) => (
                    <Card key={student.userId} className="border-primary/20 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <User className="h-5 w-5 text-primary" />
                              {student.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              <Mail className="h-3 w-3 inline mr-1" />
                              {student.email}
                            </CardDescription>
                          </div>
                          {student.matchingRequestedAt && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                              <Calendar className="h-3 w-3 mr-1" />
                              {student.matchingRequestedAt?.toDate
                                ? new Date(student.matchingRequestedAt.toDate()).toLocaleDateString()
                                : new Date(student.matchingRequestedAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        {student.matchingCategories && student.matchingCategories.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Tags className="h-4 w-4 text-primary" />
                              Interested in
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {student.matchingCategories.map((category) => (
                                <Badge key={category} variant="secondary" className="bg-primary/10 text-primary">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {student.matchingNote && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm text-foreground italic">"{student.matchingNote}"</p>
                          </div>
                        )}

                        {student.skills && student.skills.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Award className="h-4 w-4 text-primary" />
                              Skills
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {student.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-primary/20">
                          <Button
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleStartAssignFromMatchRequest(student.userId)}
                            disabled={processingMatchId === student.userId}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign a partnership
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleDismissMatchRequest(student.userId)}
                            disabled={processingMatchId === student.userId}
                          >
                            {processingMatchId === student.userId ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Dismiss
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
              {/* Overview stat cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Handshake className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-semibold font-heading text-foreground leading-none tracking-tight">{assignments.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Active Partnerships</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-semibold font-heading text-foreground leading-none tracking-tight">{businesses.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Approved Businesses</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center mb-4">
                    <Users className="h-4 w-4 text-slate-600" />
                  </div>
                  <p className="text-3xl font-semibold font-heading text-foreground leading-none tracking-tight">{students.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total Students</p>
                </div>
                <button
                  onClick={() => setActiveTab("matchRequests")}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm text-left hover:border-amber-500/40 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-3xl font-semibold font-heading text-foreground leading-none tracking-tight">{matchRequests.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Pending Match Requests</p>
                </button>
              </div>

              {/* Businesses & Students directories */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <Building2 className="h-4 w-4 text-primary" />
                      Businesses
                      <Badge variant="secondary" className="ml-auto font-normal">
                        {businesses.length}
                      </Badge>
                    </CardTitle>
                    <div className="relative pt-2">
                      <Search className="absolute left-3 top-1/2 mt-1 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={businessSearch}
                        onChange={(e) => setBusinessSearch(e.target.value)}
                        placeholder="Search businesses..."
                        className="pl-9"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[360px] overflow-y-auto">
                    {businesses
                      .filter((b) =>
                        `${b.companyName} ${b.location} ${b.industry}`
                          .toLowerCase()
                          .includes(businessSearch.toLowerCase())
                      )
                      .map((business) => (
                        <div
                          key={business.userId}
                          className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {business.companyName?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {business.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {business.location} &middot; {business.industry}
                            </p>
                          </div>
                        </div>
                      ))}
                    {businesses.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No approved businesses yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <Users className="h-4 w-4 text-primary" />
                      Students
                      <Badge variant="secondary" className="ml-auto font-normal">
                        {students.length}
                      </Badge>
                    </CardTitle>
                    <div className="relative pt-2">
                      <Search className="absolute left-3 top-1/2 mt-1 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search students..."
                        className="pl-9"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[360px] overflow-y-auto">
                    {students
                      .filter((s) =>
                        `${s.name} ${s.email} ${(s.skills || []).join(" ")}`
                          .toLowerCase()
                          .includes(studentSearch.toLowerCase())
                      )
                      .map((student) => (
                        <div
                          key={student.userId}
                          className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {student.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.skills && student.skills.length > 0
                                ? student.skills.slice(0, 3).join(", ")
                                : student.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    {students.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No students yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Midpoint Check-ins */}
              {(() => {
                const overdueCount = assignments.filter((a) => getMidpointStatus(a) === "overdue").length;
                const soonCount = assignments.filter((a) => getMidpointStatus(a) === "soon").length;
                const unscheduledCount = assignments.filter((a) => getMidpointStatus(a) === "unscheduled").length;
                const sortedAssignments = [...assignments].sort(
                  (a, b) => midpointStatusOrder[getMidpointStatus(a)] - midpointStatusOrder[getMidpointStatus(b)]
                );

                return (
                  <Card className="border-primary/20 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        Midpoint Check-ins
                      </CardTitle>
                      <CardDescription>
                        Track when each partnership's midpoint meeting is due, straight from the contract.
                      </CardDescription>
                      {assignments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {overdueCount > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <AlarmClock className="h-3 w-3 mr-1" />
                              {overdueCount} overdue
                            </Badge>
                          )}
                          {soonCount > 0 && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {soonCount} this week
                            </Badge>
                          )}
                          {unscheduledCount > 0 && (
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                              {unscheduledCount} need a date
                            </Badge>
                          )}
                          {overdueCount === 0 && soonCount === 0 && unscheduledCount === 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              All caught up
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      {assignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">
                          Create a partnership below to start tracking midpoint meetings.
                        </p>
                      ) : (
                        <div className="divide-y divide-border">
                          {sortedAssignments.map((assignment) => {
                            const status = getMidpointStatus(assignment);
                            const meta = midpointStatusMeta[status];
                            const key = `${assignment.opportunityId}-${assignment.studentId}`;
                            const isSaving = savingMidpointFor === key;
                            return (
                              <div key={key} className="flex flex-wrap items-center gap-3 sm:gap-4 px-5 py-4">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                                <div className="min-w-[160px] flex-1">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {assignment.business?.companyName || "Unknown Business"}
                                    <span className="text-muted-foreground font-normal"> &times; </span>
                                    {assignment.student?.name || "Unknown Student"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {assignment.opportunityId.startsWith("business-")
                                      ? "General assignment"
                                      : assignment.opportunity?.title || "Opportunity"}
                                  </p>
                                </div>
                                <Badge variant="outline" className={`${meta.badge} flex-shrink-0 whitespace-nowrap`}>
                                  {meta.label}
                                  {assignment.midpointMeetingDate && (
                                    <span className="ml-1 opacity-70">
                                      &middot; {formatMidpointDate(assignment.midpointMeetingDate)}
                                    </span>
                                  )}
                                </Badge>
                                <Input
                                  type="date"
                                  value={toDateInputValue(assignment.midpointMeetingDate)}
                                  onChange={(e) =>
                                    handleSetMidpointDate(assignment.opportunityId, assignment.studentId, e.target.value)
                                  }
                                  disabled={isSaving}
                                  className="w-[150px] flex-shrink-0 h-9 text-sm"
                                />
                                <label className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0 cursor-pointer">
                                  <Checkbox
                                    checked={!!assignment.midpointMeetingCompleted}
                                    disabled={isSaving}
                                    onCheckedChange={(checked) =>
                                      handleToggleMidpointCompleted(
                                        assignment.opportunityId,
                                        assignment.studentId,
                                        checked === true
                                      )
                                    }
                                  />
                                  Done
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

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
                            {assignment.opportunityId.startsWith("business-") ? (
                              <>
                                <p className="font-medium text-foreground italic">
                                  General Business Assignment
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Legacy business-wide assignment (not tied to a specific opportunity)
                                </p>
                              </>
                            ) : (
                              <>
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
                              </>
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

                        {/* Contract PDF Upload/View */}
                        <Separator className="bg-primary/20" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <FileText className="h-4 w-4" />
                            Contract PDF
                          </div>
                          {assignment.contractPdfUrl ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  PDF Uploaded
                                </Badge>
                                <a
                                  href={assignment.contractPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View PDF
                                </a>
                              </div>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handlePdfUpload(assignment.opportunityId, assignment.studentId, file);
                                  }}
                                />
                                <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer underline">
                                  Replace PDF
                                </span>
                              </label>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload(assignment.opportunityId, assignment.studentId, file);
                                }}
                              />
                              {uploadingPdfFor === `${assignment.opportunityId}-${assignment.studentId}` ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Uploading...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 border-2 border-dashed border-primary/30 rounded-lg p-3 hover:border-primary/60 hover:bg-primary/5 transition-all">
                                  <Upload className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-muted-foreground">
                                    Drop or click to upload contract PDF
                                  </span>
                                </div>
                              )}
                            </label>
                          )}
                        </div>

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

          {/* Feed Tab */}
          {activeTab === "feed" && (
            <>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Post to the Community Feed
                  </CardTitle>
                  <CardDescription>
                    Share a project spotlight — this is what students see when they log in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Caption</label>
                    <Textarea
                      placeholder="E.g. A full checkout redesign just kicked off with Blue Sky Coffee Co...."
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Business (optional)</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Blue Sky Coffee Co."
                        value={postBusinessName}
                        onChange={(e) => setPostBusinessName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category (optional)</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Web Design"
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={submittingPost || !postCaption.trim()}
                    className="w-full sm:w-auto"
                  >
                    {submittingPost ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Post to Feed
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No posts yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your first post will show up on every student's home page.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-foreground">{post.caption}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {post.businessName && (
                                <Badge variant="outline" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {post.businessName}
                                </Badge>
                              )}
                              {post.category && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  {post.category}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likedBy.length}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id!)}
                            disabled={deletingPostId === post.id}
                          >
                            {deletingPostId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
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
        </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
