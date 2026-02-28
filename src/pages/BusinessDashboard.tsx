import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessData, updateBusinessData, BusinessData, getBadgeStatus, BadgeStatus, Application, acceptApplication, rejectApplication } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import CategorySelector from "@/components/CategorySelector";
import Disclaimer from "@/components/Disclaimer";
import AssignedStudents from "@/components/AssignedStudents";
import MyOpportunities from "@/components/MyOpportunities";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast as sonnerToast } from "sonner";
import {
  Loader2,
  LogOut,
  Building2,
  MapPin,
  Briefcase,
  User,
  Mail,
  Phone,
  AlertCircle,
  Edit2,
  Save,
  X,
  FileText,
  Award,
  Tags,
  Users,
  Menu,
  ChevronLeft,
  ThumbsUp,
  ExternalLink,
  Clock
} from "lucide-react";

type ActiveSection = "profile" | "opportunities" | "students";

const BusinessDashboard = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatus>({ completedProjects: 0, badge: "none" });
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    location: "",
    industry: "",
    contactPersonName: "",
    email: "",
    phone: "",
    preferredContactMethod: "Email" as "Email" | "Phone",
    potentialProblems: "",
    categories: [] as string[],
  });

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser?.uid || currentUser.uid === fetchedUserId) {
      if (currentUser?.uid === fetchedUserId) {
        setLoading(false);
      }
      return;
    }

    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getBusinessData(currentUser.uid);
        setBusinessData(data);
        setFetchedUserId(currentUser.uid);
        if (data) {
          setFormData({
            companyName: data.companyName || "",
            location: data.location || "",
            industry: data.industry || "",
            contactPersonName: data.contactPersonName || "",
            email: data.email || "",
            phone: data.phone || "",
            preferredContactMethod: data.preferredContactMethod || "Email",
            potentialProblems: data.potentialProblems || "",
            categories: data.categories || [],
          });

          // Fetch badge status
          const badge = await getBadgeStatus(currentUser.uid);
          setBadgeStatus(badge);
        } else {
          navigate("/business/signup");
        }
      } catch (err) {
        setError("Failed to load business data");
        setFetchedUserId(currentUser.uid);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [currentUser?.uid, authLoading, fetchedUserId, navigate]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoadingApplications(true);
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
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [currentUser?.uid]);

  const handleAcceptApplication = async (application: Application) => {
    if (!application.id) return;

    try {
      await acceptApplication(application.id);
      sonnerToast.success("Application accepted! Student will appear in Assigned Students.");

      // Refresh applications
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "accepted" } : app
        )
      );
    } catch (error) {
      console.error("Error accepting application:", error);
      sonnerToast.error("Failed to accept application");
    }
  };

  const handleRejectApplication = async (application: Application) => {
    if (!application.id) return;

    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }

    try {
      await rejectApplication(application.id);
      sonnerToast.success("Application rejected");

      // Refresh applications
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "rejected" } : app
        )
      );
    } catch (error) {
      sonnerToast.error("Failed to reject application");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (businessData) {
      setFormData({
        companyName: businessData.companyName || "",
        location: businessData.location || "",
        industry: businessData.industry || "",
        contactPersonName: businessData.contactPersonName || "",
        email: businessData.email || "",
        phone: businessData.phone || "",
        preferredContactMethod: businessData.preferredContactMethod || "Email",
        potentialProblems: businessData.potentialProblems || "",
        categories: businessData.categories || [],
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!currentUser?.uid || !businessData) return;

    if (!formData.companyName || !formData.location || !formData.industry ||
        !formData.contactPersonName || !formData.email || !formData.phone ||
        !formData.potentialProblems) {
      setError("Please fill in all required fields");
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateBusinessData(currentUser.uid, {
        ...businessData,
        ...formData,
      });

      // Refresh data
      const updatedData = await getBusinessData(currentUser.uid);
      setBusinessData(updatedData);
      setIsEditing(false);

      // Show success notification
      toast({
        title: "Profile Updated",
        description: "Your business information has been successfully updated.",
        variant: "default",
      });
    } catch (err) {
      setError("Failed to update business data");
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" style={{ fontFamily: 'Arimo, sans-serif' }}>
      {/* Header */}
      <header className="bg-nextstep-brick sticky top-0 z-50 shadow-warm-md">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">Business Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Applications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hidden md:flex relative"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Applications
                  {applications.filter(app => !app.status || app.status === "pending").length > 0 && (
                    <Badge className="ml-2 bg-red-500 hover:bg-red-600 h-5 min-w-5 px-1.5 text-xs">
                      {applications.filter(app => !app.status || app.status === "pending").length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-sm">Applications</h3>
                    <p className="text-xs text-muted-foreground">
                      {applications.filter(app => !app.status || app.status === "pending").length} pending
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/business/applications")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  {loadingApplications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-foreground">No applications yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applications will appear here when students apply
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {applications.slice(0, 10).map((application) => (
                        <div key={application.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="font-medium text-sm truncate">
                                    {application.studentName || "Student"}
                                  </span>
                                </div>
                                {application.opportunityTitle && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    For: {application.opportunityTitle}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  {application.appliedAt?.toDate
                                    ? new Date(application.appliedAt.toDate()).toLocaleDateString()
                                    : new Date(application.appliedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {(application as any).status === "accepted" && (
                                  <Badge variant="secondary" className="bg-green-600/10 text-green-700 text-xs">
                                    Accepted
                                  </Badge>
                                )}
                                {(application as any).status === "rejected" && (
                                  <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                                    Rejected
                                  </Badge>
                                )}
                                {(!((application as any).status) || (application as any).status === "pending") && (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions for pending applications */}
                            {(!((application as any).status) || (application as any).status === "pending") && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectApplication(application)}
                                  className="flex-1 h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptApplication(application)}
                                  className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {applications.length > 10 && (
                  <div className="p-3 border-t border-border text-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate("/business/applications")}
                      className="text-xs"
                    >
                      View all {applications.length} applications
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <span className="text-sm text-white/70 hidden md:inline">{currentUser?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
            sidebarExpanded ? 'w-[220px]' : 'w-[48px]'
          }`}
        >
          {/* Toggle Button */}
          <div className="flex items-center justify-end p-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="h-8 w-8 p-0"
            >
              {sidebarExpanded ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Profile Card - Only show when expanded */}
          {sidebarExpanded && (
            <div className="p-4 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full mb-3 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="font-bold text-sm mb-1 truncate w-full">
                  {businessData?.companyName || "Business"}
                </h2>
                <p className="text-xs text-muted-foreground truncate w-full">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === "profile"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
              title={!sidebarExpanded ? "Profile" : ""}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">Profile</span>}
            </button>

            <button
              onClick={() => setActiveSection("opportunities")}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === "opportunities"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
              title={!sidebarExpanded ? "My Opportunities" : ""}
            >
              <Briefcase className="h-5 w-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">My Opportunities</span>}
            </button>

            <button
              onClick={() => setActiveSection("students")}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                activeSection === "students"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
              title={!sidebarExpanded ? "Assigned Students" : ""}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm">Assigned Students</span>}
            </button>
          </nav>
        </aside>

        {/* Mobile Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
          <nav className="flex justify-around p-2">
            <button
              onClick={() => setActiveSection("profile")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                activeSection === "profile"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground"
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </button>

            <button
              onClick={() => setActiveSection("opportunities")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                activeSection === "opportunities"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground"
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Opportunities</span>
            </button>

            <button
              onClick={() => setActiveSection("students")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                activeSection === "students"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Students</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container py-6 max-w-5xl">
            {/* Disclaimer */}
            <div className="mb-6">
              <Disclaimer />
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {businessData ? (
              <>
                {/* Profile Section */}
                {activeSection === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold font-heading mb-2">Company Profile</h2>
                      <p className="text-muted-foreground">
                        Manage your business information and details
                      </p>
                    </div>

                    <Card className="border-0 shadow-warm-md bg-card">
                      <CardHeader className="border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <Building2 className="h-5 w-5 text-primary" />
                              Company Information
                            </CardTitle>
                            <CardDescription className="mt-1">Your business profile details</CardDescription>
                          </div>
                          {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={handleEdit}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                              <Button variant="default" size="sm" onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {isEditing ? (
                  <form className="space-y-8">
                    {/* Business Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">
                            Company Name <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="companyName"
                              className="pl-10"
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              required
                              disabled={saving}
                              placeholder="Acme Inc."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">
                            Location <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              className="pl-10"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              required
                              disabled={saving}
                              placeholder="San Francisco, CA"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">
                          Industry / What You Do <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          required
                          disabled={saving}
                          rows={4}
                          placeholder="We're a tech startup building innovative AI solutions..."
                        />
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonName">
                          Contact Person Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contactPersonName"
                            className="pl-10"
                            value={formData.contactPersonName}
                            onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                            required
                            disabled={saving}
                            placeholder="Jane Smith"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Contact Email <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              className="pl-10"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              disabled={saving}
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              className="pl-10"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                              disabled={saving}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>
                          Preferred Contact Method <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.preferredContactMethod}
                          onValueChange={(value: "Email" | "Phone") =>
                            setFormData({ ...formData, preferredContactMethod: value })
                          }
                          disabled={saving}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Email" id="email-contact" />
                            <Label htmlFor="email-contact" className="font-normal cursor-pointer">
                              <Mail className="h-4 w-4 inline mr-1" />
                              Email
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Phone" id="phone-contact" />
                            <Label htmlFor="phone-contact" className="font-normal cursor-pointer">
                              <Phone className="h-4 w-4 inline mr-1" />
                              Phone
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    {/* Project Needs Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Project Needs</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="potentialProblems">
                          What do you need help with? <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Describe your project needs and challenges
                        </p>
                        <Textarea
                          id="potentialProblems"
                          value={formData.potentialProblems}
                          onChange={(e) => setFormData({ ...formData, potentialProblems: e.target.value })}
                          required
                          disabled={saving}
                          rows={5}
                          placeholder="We're looking for help with social media marketing, content creation, and community engagement..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Tags className="h-4 w-4 inline mr-1 text-primary" />
                          Project Categories
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Select all categories that apply to your project needs (optional)
                        </p>
                        <CategorySelector
                          selectedCategories={formData.categories}
                          onChange={(categories) => setFormData({ ...formData, categories })}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Save Button at Bottom */}
                    <div className="flex gap-3 pt-4 border-t border-primary/20">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    {/* Business Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Building2 className="h-4 w-4 text-primary" />
                            Company Name
                          </div>
                          <p className="text-lg font-semibold text-foreground">{businessData.companyName}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            Location
                          </div>
                          <p className="text-lg font-semibold text-foreground">{businessData.location}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Industry / What You Do
                        </div>
                        <p className="text-base whitespace-pre-wrap text-foreground">{businessData.industry}</p>
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <User className="h-4 w-4 text-primary" />
                          Contact Person
                        </div>
                        <p className="text-lg font-semibold text-foreground">{businessData.contactPersonName}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Mail className="h-4 w-4 text-primary" />
                            Email
                          </div>
                          <p className="text-base text-foreground">{businessData.email}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone
                          </div>
                          <p className="text-base text-foreground">{businessData.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Preferred Contact Method
                        </div>
                        <div className="flex items-center gap-2">
                          {businessData.preferredContactMethod === "Email" ? (
                            <Mail className="h-4 w-4 text-primary" />
                          ) : (
                            <Phone className="h-4 w-4 text-primary" />
                          )}
                          <p className="text-base font-semibold text-foreground">{businessData.preferredContactMethod}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    {/* Project Needs Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Project Needs</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          What You Need Help With
                        </div>
                        <p className="text-base whitespace-pre-wrap text-foreground">{businessData.potentialProblems}</p>
                      </div>

                      {businessData.categories && businessData.categories.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Tags className="h-4 w-4 text-primary" />
                            Project Categories
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {businessData.categories.map((category) => (
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
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
                    </Card>

                    {businessData.createdAt && (
                      <Card className="border-0 shadow-warm-md bg-card">
                        <CardHeader>
                          <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Profile created: {businessData.createdAt?.toDate
                              ? new Date(businessData.createdAt.toDate()).toLocaleDateString()
                              : new Date(businessData.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* My Opportunities Section */}
                {activeSection === "opportunities" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold font-heading mb-2">My Opportunities</h2>
                      <p className="text-muted-foreground">
                        Create and manage your job postings
                      </p>
                    </div>
                    <MyOpportunities />
                  </div>
                )}

                {/* Assigned Students Section */}
                {activeSection === "students" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold font-heading mb-2">Assigned Students</h2>
                      <p className="text-muted-foreground">
                        View and connect with students matched to your business
                      </p>
                    </div>
                    {currentUser?.uid && <AssignedStudents businessId={currentUser.uid} />}
                  </div>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-warm-md bg-card">
                <CardHeader>
                  <CardTitle>No Profile Found</CardTitle>
                  <CardDescription>
                    Please complete your business profile to view your dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessDashboard;
