import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Calendar, Briefcase, Sparkles, Target, Loader2, Star, Award, TrendingUp, Settings, Edit2, Save, X, Plus, Link2, HelpCircle, Send, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import JobPostingsList from "@/components/JobPostingsList";
import { getStudentProfile, updateStudentProfile, updateMatchingPreference } from "@/lib/firestore";
import emailjs from '@emailjs/browser';
import logo from "@/assets/NextStepLogo.png";

import Disclaimer from "@/components/Disclaimer";
import StudentRatings from "@/components/StudentRatings";
import MatchedOpportunities from "@/components/MatchedOpportunities";
import MyApplications from "@/components/MyApplications";
import CurrentProjects from "@/components/CurrentProjects";

const StudentDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openToMatching, setOpenToMatching] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingPreference, setUpdatingPreference] = useState(false);
  const [activeSection, setActiveSection] = useState<"opportunities" | "applications" | "profile" | "matching" | "questions">("opportunities");
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    skills: [] as string[],
    desiredRoles: [] as string[],
    bio: "",
    linkedinUrl: "",
  });

  // Temp inputs for adding skills/roles
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  // Questions form state
  const [questionForm, setQuestionForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sendingQuestion, setSendingQuestion] = useState(false);

  // Load student profile
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.uid) {
        try {
          setLoadingProfile(true);
          const profile = await getStudentProfile(currentUser.uid);
          if (profile) {
            setStudentProfile(profile);
            setOpenToMatching(profile.openToMatching || false);
            // Initialize form data
            setFormData({
              name: profile.name || "",
              skills: profile.skills || [],
              desiredRoles: profile.desiredRoles || [],
              bio: profile.bio || "",
              linkedinUrl: profile.linkedinUrl || "",
            });
            // Pre-fill question form
            setQuestionForm({
              name: profile.name || "",
              email: currentUser.email || "",
              subject: "",
              message: "",
            });
          }
        } catch (error) {
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
  }, [currentUser?.uid, currentUser?.email]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
    }
  };

  const handleMatchingToggle = async (checked: boolean) => {
    if (!currentUser?.uid) return;

    try {
      setUpdatingPreference(true);
      await updateMatchingPreference(currentUser.uid, checked);
      setOpenToMatching(checked);
    } catch (error) {
    } finally {
      setUpdatingPreference(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (studentProfile) {
      setFormData({
        name: studentProfile.name || "",
        skills: studentProfile.skills || [],
        desiredRoles: studentProfile.desiredRoles || [],
        bio: studentProfile.bio || "",
        linkedinUrl: studentProfile.linkedinUrl || "",
      });
    }
    setSkillInput("");
    setRoleInput("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;

    if (!formData.name || formData.skills.length === 0 || formData.desiredRoles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in your name, at least one skill, and at least one desired role.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        name: formData.name,
        skills: formData.skills,
        desiredRoles: formData.desiredRoles,
      };

      // Only add optional fields if they have values
      if (formData.bio) {
        updateData.bio = formData.bio;
      }
      if (formData.linkedinUrl) {
        updateData.linkedinUrl = formData.linkedinUrl;
      }

      await updateStudentProfile(currentUser.uid, updateData);

      // Refresh profile
      const updatedProfile = await getStudentProfile(currentUser.uid);
      setStudentProfile(updatedProfile);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addRole = () => {
    if (roleInput.trim() && !formData.desiredRoles.includes(roleInput.trim())) {
      setFormData({ ...formData, desiredRoles: [...formData.desiredRoles, roleInput.trim()] });
      setRoleInput("");
    }
  };

  const removeRole = (role: string) => {
    setFormData({ ...formData, desiredRoles: formData.desiredRoles.filter(r => r !== role) });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionForm.subject || !questionForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingQuestion(true);

      // Initialize EmailJS (you'll need to replace these with your actual values)
      emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key

      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        {
          from_name: questionForm.name,
          from_email: questionForm.email,
          subject: questionForm.subject,
          message: questionForm.message,
          to_email: 'nextstep.connects@gmail.com', // Your support email
        }
      );

      toast({
        title: "Message Sent",
        description: "Your question has been sent. We'll get back to you soon!",
        variant: "default",
      });

      // Reset form
      setQuestionForm({
        ...questionForm,
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send your message. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setSendingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30" style={{ fontFamily: 'Arimo, sans-serif' }}>
      {/* Dark Header - Matching dashboard.png */}
      <header className="bg-nextstep-brick sticky top-0 z-50 shadow-warm-md">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NextStep Logo" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70 hidden md:inline">{currentUser?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout - Two Column like dashboard.png */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-warm-md bg-card">
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-bold text-lg mb-1">
                  {studentProfile?.name || "Student"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentUser?.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setActiveSection("profile")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-0 shadow-warm-md bg-card">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection("opportunities")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === "opportunities"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Briefcase className="h-5 w-5" />
                    Opportunities
                  </button>
                  <button
                    onClick={() => setActiveSection("applications")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === "applications"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    My Applications
                  </button>
                  
                  <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === "profile"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    Profile & Ratings
                  </button>
                  <button
                    onClick={() => setActiveSection("questions")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === "questions"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    Questions
                  </button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="space-y-6">
            {/* Disclaimer */}
            <Disclaimer />

            {/* Opportunities Section */}
            {activeSection === "opportunities" && (
              <div className="space-y-6">
                {/* Current Projects - Show accepted applications at the very top */}
                {currentUser?.uid && <CurrentProjects studentId={currentUser.uid} />}

                {/* Matched Opportunities - Show at top if student is assigned to businesses */}

                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">Available Opportunities</h2>
                  <p className="text-muted-foreground">
                    Browse and apply to projects from local businesses
                  </p>
                </div>
                <JobPostingsList />
              </div>
            )}

            {/* Applications Section */}
            {activeSection === "applications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">My Applications</h2>
                  <p className="text-muted-foreground">
                    Track the status of your submitted applications
                  </p>
                </div>
                {currentUser?.uid && <MyApplications studentId={currentUser.uid} />}
              </div>
            )}

            {/* Smart Matching Section */}
            {activeSection === "matching" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">Smart Matching</h2>
                  <p className="text-muted-foreground">
                  Not finding the perfect match? Enable Smart Matching to allow us to find the opportunities for you without lifting a finger.                  </p>
                </div>

                {/* Matching Preference Card */}
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-2xl">Matching Preference</CardTitle>
                        <CardDescription className="text-base">
                        What we need from you:
                          </CardDescription>
                          
                          </div>
                      {loadingProfile ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Switch
                            id="matching-preference"
                            checked={openToMatching}
                            onCheckedChange={handleMatchingToggle}
                            disabled={updatingPreference}
                          />
                          <Label
                            htmlFor="matching-preference"
                            className={`text-sm font-semibold cursor-pointer ${
                              openToMatching ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {openToMatching ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Updated Profile</p>
                          <p className="text-sm text-muted-foreground">
                          Keep your profile updated to receive the best opportunity matches. Your profile is what businesses use to find the best fit for their projects.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Sit tight</p>
                          <p className="text-sm text-muted-foreground">
                          We network with local businesses and find tailored matches for you.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Get to work</p>
                          <p className="text-sm text-muted-foreground">
                       We'll notify you if we find a match that you might be interested in. Make sure to check your email for updates once we match you.
                          </p>
                        </div>
                      </div>
                    </div>

                    {openToMatching && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <p className="text-sm font-semibold text-primary">Smart Matching Active</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Keep your profile updated to receive the best opportunity matches. We'll notify you when businesses are looking for someone with your skillset.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">Profile Information</h2>
                  <p className="text-muted-foreground">
                    Manage your personal information and view your ratings
                  </p>
                </div>

                {/* Profile Details Card with Edit Functionality */}
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Profile Details</CardTitle>
                        <CardDescription>
                          Your professional information
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isEditing ? (
                      <form className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Full Name <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                className="pl-10"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={saving}
                                placeholder="John Doe"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Skills Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <Award className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Skills</h3>
                          </div>
                          <div className="space-y-2">
                            <Label>Your Skills <span className="text-destructive">*</span></Label>
                            <div className="flex gap-2">
                              <Input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                placeholder="Add a skill..."
                                disabled={saving}
                              />
                              <Button type="button" onClick={addSkill} disabled={saving} size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {formData.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {formData.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() => removeSkill(skill)}
                                      className="ml-2 hover:text-destructive"
                                      disabled={saving}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Desired Roles Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Desired Roles</h3>
                          </div>
                          <div className="space-y-2">
                            <Label>Roles You're Interested In <span className="text-destructive">*</span></Label>
                            <div className="flex gap-2">
                              <Input
                                value={roleInput}
                                onChange={(e) => setRoleInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                                placeholder="Add a role..."
                                disabled={saving}
                              />
                              <Button type="button" onClick={addRole} disabled={saving} size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {formData.desiredRoles.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {formData.desiredRoles.map((role) => (
                                  <Badge key={role} variant="secondary" className="pl-3 pr-1 py-1">
                                    {role}
                                    <button
                                      type="button"
                                      onClick={() => removeRole(role)}
                                      className="ml-2 hover:text-destructive"
                                      disabled={saving}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Bio Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">About You</h3>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Elevator Pitch / Bio</Label>
                            <p className="text-sm text-muted-foreground">Tell businesses about yourself in 150 characters or less</p>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              disabled={saving}
                              rows={4}
                              maxLength={150}
                              placeholder="Passionate designer with 3 years experience in UI/UX..."
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {formData.bio.length}/150 characters
                            </p>
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Links Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <Link2 className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Professional Links</h3>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <div className="relative">
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="linkedin"
                                type="url"
                                className="pl-10"
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                disabled={saving}
                                placeholder="https://linkedin.com/in/yourprofile"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Name</Label>
                              <p className="font-semibold text-foreground">{studentProfile?.name || "Not set"}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Email</Label>
                              <p className="font-semibold text-foreground break-all">{currentUser?.email}</p>
                            </div>
                            {currentUser?.metadata.creationTime && (
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Member Since</Label>
                                <p className="font-semibold text-foreground">
                                  {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-primary/20" />

                        {/* Skills Section */}
                        {studentProfile?.skills && studentProfile.skills.length > 0 && (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                                <Award className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">Skills</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {studentProfile.skills.map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Separator className="bg-primary/20" />
                          </>
                        )}

                        {/* Desired Roles Section */}
                        {studentProfile?.desiredRoles && studentProfile.desiredRoles.length > 0 && (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">Desired Roles</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {studentProfile.desiredRoles.map((role: string) => (
                                  <Badge key={role} variant="secondary" className="bg-primary/10 text-primary">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Separator className="bg-primary/20" />
                          </>
                        )}

                        {/* Bio Section */}
                        {studentProfile?.bio && (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">About Me</h3>
                              </div>
                              <p className="text-foreground">{studentProfile.bio}</p>
                            </div>
                            <Separator className="bg-primary/20" />
                          </>
                        )}

                        {/* Links Section */}
                        {studentProfile?.linkedinUrl && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                              <Link2 className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold text-foreground">Professional Links</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm text-muted-foreground">LinkedIn</Label>
                                <a
                                  href={studentProfile.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline block break-all"
                                >
                                  {studentProfile.linkedinUrl}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ratings */}
                <StudentRatings />
              </div>
            )}

            {/* Questions Section */}
            {activeSection === "questions" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">Have Questions?</h2>
                  <p className="text-muted-foreground">
                    Send us a message and we'll get back to you as soon as possible
                  </p>
                </div>

                <Card className="border-0 shadow-warm-md bg-card">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below to send us your question
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleQuestionSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="question-name">Your Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="question-name"
                              className="pl-10"
                              value={questionForm.name}
                              onChange={(e) => setQuestionForm({ ...questionForm, name: e.target.value })}
                              disabled={sendingQuestion}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="question-email">Your Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="question-email"
                              type="email"
                              className="pl-10"
                              value={questionForm.email}
                              onChange={(e) => setQuestionForm({ ...questionForm, email: e.target.value })}
                              disabled={sendingQuestion}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="question-subject">Subject</Label>
                        <Input
                          id="question-subject"
                          value={questionForm.subject}
                          onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                          disabled={sendingQuestion}
                          required
                          placeholder="What's your question about?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="question-message">Message</Label>
                        <Textarea
                          id="question-message"
                          value={questionForm.message}
                          onChange={(e) => setQuestionForm({ ...questionForm, message: e.target.value })}
                          disabled={sendingQuestion}
                          required
                          rows={6}
                          placeholder="Please describe your question in detail..."
                        />
                      </div>

                      <Alert className="bg-primary/5 border-primary/20">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          We typically respond within 24-48 hours. For urgent matters, please email us directly at nextstep.connects@gmail.com

                        </AlertDescription>
                      </Alert>

                      <Button type="submit" disabled={sendingQuestion} className="w-full" size="lg">
                        {sendingQuestion ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* FAQ or Additional Info */}
               
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
