import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Briefcase, Sparkles, Loader2, Award, Edit2, Save, X, Plus, Link2, HelpCircle, Send, Handshake, ArrowLeft, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getStudentProfile, updateStudentProfile } from "@/lib/firestore";
import { sendContactMessage } from "@/lib/emailNotifications";
import logo from "@/assets/images/NextStepLogo.png";

import Disclaimer from "@/components/Disclaimer";
import MyPartnerships from "@/components/MyPartnerships";
import CommunityFeed from "@/components/CommunityFeed";

const StudentDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeSection, setActiveSection] = useState<"feed" | "partnerships" | "profile" | "questions">("feed");
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
  const studentInitials = (studentProfile?.name || currentUser?.email || "S")
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Load student profile
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.uid) {
        try {
          setLoadingProfile(true);
          const profile = await getStudentProfile(currentUser.uid);
          if (profile) {
            setStudentProfile(profile);
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

      const sent = await sendContactMessage({
        fromName: questionForm.name,
        fromEmail: questionForm.email,
        subject: questionForm.subject,
        message: questionForm.message,
      });

      if (sent) {
        toast({
          title: "Email has been received!",
          description: "The NextStep team will reach out to you very shortly.",
          variant: "default",
        });
        setQuestionForm({
          ...questionForm,
          subject: "",
          message: "",
        });
      } else {
        toast({
          title: "Contact form isn't set up yet",
          description: "Please email us directly at nextstep.connects@gmail.com in the meantime.",
          variant: "destructive",
        });
      }
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
      {/* Dark Header */}
      <header className="bg-nextstep-brick sticky top-0 z-50 shadow-warm-md">
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => setActiveSection("feed")}
            className="flex items-center gap-3"
          >
            <img src={logo} alt="NextStep Logo" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full transition-colors ${
                  activeSection === "profile" ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {studentInitials}
                </span>
                <span className="text-sm text-white/90 hidden md:inline">
                  {studentProfile?.name || currentUser?.email}
                </span>
                <ChevronDown className="h-4 w-4 text-white/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setActiveSection("feed")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Community Feed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("partnerships")}>
                <Handshake className="h-4 w-4 mr-2" />
                My Partnerships
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("questions")}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Questions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveSection("profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container py-8">
          <main className="space-y-6">
            {/* Disclaimer */}
            <Disclaimer />

            {activeSection === "profile" && (
              <button
                onClick={() => setActiveSection("feed")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </button>
            )}

            {/* Community Feed Section */}
            {activeSection === "feed" && currentUser?.uid && (
              <CommunityFeed studentId={currentUser.uid} />
            )}

            {/* My Partnerships Section */}
            {activeSection === "partnerships" && currentUser?.uid && (
              <MyPartnerships
                studentId={currentUser.uid}
                studentProfile={studentProfile}
                onProfileUpdate={(updates) =>
                  setStudentProfile((prev: any) => ({ ...(prev || {}), ...updates }))
                }
              />
            )}


            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
                {/* Identity card */}
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold font-heading mx-auto mb-4">
                      {studentInitials}
                    </div>
                    <h2 className="text-xl font-bold font-heading text-foreground">
                      {studentProfile?.name || "Student"}
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="text-sm text-primary font-semibold hover:underline mt-1"
                      >
                        Edit basic info
                      </button>
                    )}

                    <Separator className="my-5" />

                    <div className="space-y-4 text-left">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground break-all">{currentUser?.email}</p>
                      </div>
                      {currentUser?.metadata.creationTime && (
                        <div>
                          <p className="text-xs text-muted-foreground">Member since</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Details Card with Edit Functionality */}
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">About</CardTitle>
                        <CardDescription>
                          Your professional information
                        </CardDescription>
                      </div>
                      {isEditing && (
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
                    ) : !studentProfile?.skills?.length &&
                      !studentProfile?.desiredRoles?.length &&
                      !studentProfile?.bio &&
                      !studentProfile?.linkedinUrl ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Your profile is empty. Add your skills, interests, and a short bio so businesses know who you are.
                        </p>
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Complete your profile
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
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
  );
};

export default StudentDashboard;
