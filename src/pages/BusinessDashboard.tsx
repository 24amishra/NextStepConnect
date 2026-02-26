import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessData, updateBusinessData, BusinessData, getBadgeStatus, BadgeStatus } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import CategorySelector from "@/components/CategorySelector";
import Disclaimer from "@/components/Disclaimer";
import AssignedStudents from "@/components/AssignedStudents";
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
  Tags
} from "lucide-react";

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
        console.error("Error fetching business data:", err);
        setError("Failed to load business data");
        setFetchedUserId(currentUser.uid);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [currentUser?.uid, authLoading, fetchedUserId, navigate]);

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
      console.error("Error updating business data:", err);
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
          <h1 className="text-2xl font-bold font-heading text-foreground">Business Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate("/business/applications")}
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </Button>
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
        <div className="max-w-4xl mx-auto mb-6">
          <Disclaimer />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {businessData ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
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

          

            {/* Assigned Students Section */}
            {currentUser?.uid && <AssignedStudents businessId={currentUser.uid} />}

            {businessData.createdAt && (
              <Card className="border-primary/20">
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
        ) : (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>No Profile Found</CardTitle>
              <CardDescription>
                Please complete your business profile to view your dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BusinessDashboard;
