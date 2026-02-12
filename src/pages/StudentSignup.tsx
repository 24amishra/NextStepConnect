import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveStudentProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Plus } from "lucide-react";

const StudentSignup = () => {
  const [step, setStep] = useState<"account" | "profile">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [desiredRoles, setDesiredRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [bio, setBio] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, skip to profile step
  useEffect(() => {
    if (!authLoading && currentUser) {
      setStep("profile");
      setEmail(currentUser.email || "");
    }
  }, [currentUser, authLoading]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      setStep("profile");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create account");
      } else {
        setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || skills.length === 0 || desiredRoles.length === 0) {
      setError("Please fill in name, at least one skill, and at least one desired role");
      return;
    }

    try {
      setLoading(true);
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      await saveStudentProfile({
        userId: currentUser.uid,
        name,
        email: currentUser.email || "",
        skills,
        desiredRoles,
        bio,
        resumeUrl: resumeUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        createdAt: new Date(),
      });

      navigate("/student/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to save profile");
      } else {
        setError("Failed to save profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addRole = () => {
    if (roleInput.trim() && !desiredRoles.includes(roleInput.trim())) {
      setDesiredRoles([...desiredRoles, roleInput.trim()]);
      setRoleInput("");
    }
  };

  const removeRole = (role: string) => {
    setDesiredRoles(desiredRoles.filter((r) => r !== role));
  };

  if (step === "account") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Student Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your student account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/student/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                Back to home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Tell businesses about your skills and what you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Skills <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Add your skills (e.g., Graphic Design, Photography, Python, etc.)
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  disabled={loading}
                />
                <Button type="button" onClick={addSkill} disabled={loading} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Desired Roles/Positions <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                What types of projects or positions are you looking for?
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., Marketing Intern, Web Developer, Content Creator"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
                  disabled={loading}
                />
                <Button type="button" onClick={addRole} disabled={loading} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {desiredRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {desiredRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="bg-primary/10 text-primary">
                      {role}
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About Me / Strengths</Label>
              <Textarea
                id="bio"
                placeholder="Tell businesses about yourself, your strengths, and what makes you a great candidate..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={5}
              />
            </div>

            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-foreground">Links (Optional)</h3>

              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center text-muted-foreground w-full">
            <Link to="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentSignup;
