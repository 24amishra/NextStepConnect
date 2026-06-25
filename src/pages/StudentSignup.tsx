import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { saveStudentProfile } from "@/lib/firestore";
import { sendWelcomeEmail } from "@/lib/emailNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Plus, Mail, Lock, User, ArrowRight, CheckCircle2, Sparkles, Link2, Briefcase, Tags } from "lucide-react";
import { motion } from "framer-motion";

const MAX_PITCH_CHARS = 150;

const StudentSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [desiredRoles, setDesiredRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && currentUser) {
      setEmail(currentUser.email || "");
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/student/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!currentUser) {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          setError("Please enter a valid email address");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
      }

      if (!name.trim()) {
        setError("Please enter your full name");
        return;
      }
      if (skills.length === 0) {
        setError("Please add at least one skill");
        return;
      }
      if (desiredRoles.length === 0) {
        setError("Please add at least one desired role");
        return;
      }
      if (!elevatorPitch.trim()) {
        setError("Please write your elevator pitch");
        return;
      }
      if (elevatorPitch.length > MAX_PITCH_CHARS) {
        setError(`Elevator pitch must be ${MAX_PITCH_CHARS} characters or less`);
        return;
      }

      // Create account if not already logged in
      if (!currentUser) {
        await signup(email, password);
      }

      // auth.currentUser is set synchronously after createUserWithEmailAndPassword resolves
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const profileData: any = {
        userId: user.uid,
        name,
        email: user.email || "",
        skills,
        desiredRoles,
        createdAt: new Date(),
      };

      if (elevatorPitch) {
        profileData.bio = elevatorPitch;
      }
      if (linkedinUrl) {
        profileData.linkedinUrl = linkedinUrl;
      }

      await saveStudentProfile(profileData);

      sendWelcomeEmail({
        to_email: user.email || email,
        to_name: name,
      }).catch((err) => console.error("Welcome email failed:", err));

      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = MAX_PITCH_CHARS - elevatorPitch.length;
  const isOverLimit = remainingChars < 0;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-nextstep-clay/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 bg-nextstep-clay/40 rounded-full blur-3xl"></div>
        </div>
        <Card className="w-full max-w-lg shadow-warm-lg border-0 rounded-3xl overflow-hidden relative z-10">
          <CardContent className="px-8 py-10">
            <motion.div
              className="text-center space-y-6 py-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="h-24 w-24 text-primary mx-auto" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-4xl font-bold font-heading">You're all set!</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Welcome to NextStep. Redirecting to your dashboard...
                </p>
              </motion.div>
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-gradient-to-br from-primary/10 via-background to-nextstep-clay/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-nextstep-clay/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-nextstep-clay/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute bottom-1/2 left-1/4 w-2 h-2 bg-primary/20 rounded-full"></div>
      </div>

      <Card className="w-full max-w-2xl shadow-warm-lg border-0 rounded-3xl overflow-hidden relative z-10">
        <CardContent className="px-8 py-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-heading">Join NextStep</h2>
            <p className="text-muted-foreground">Create your student profile</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Section */}
            {!currentUser && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Account
                </h3>
                <div className="space-y-4 pl-7">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-12 h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Min. 6 characters"
                          className="pl-12 h-12"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          className="pl-12 h-12"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </h3>
              <div className="space-y-4 pl-7">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-12 h-12"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Elevator Pitch <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="I'm a creative problem-solver who brings fresh ideas and strong work ethic to every project."
                    className="min-h-[100px] resize-none"
                    value={elevatorPitch}
                    onChange={(e) => setElevatorPitch(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground italic">
                      Keep it to one sentence — make it count.
                    </p>
                    <span
                      className={`font-medium transition-colors ${
                        isOverLimit
                          ? "text-destructive"
                          : remainingChars < 20
                          ? "text-warning"
                          : "text-muted-foreground"
                      }`}
                    >
                      {remainingChars} characters left
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      className="pl-12 h-12"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <Tags className="h-5 w-5 text-primary" />
                Skills <span className="text-destructive text-sm">*</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., Graphic Design, Python, Photography"
                    className="h-12"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    disabled={loading}
                    size="lg"
                    className="h-12 px-4"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-nextstep-clay text-primary border border-primary/20 px-4 py-2 text-sm shadow-warm-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Press Enter or click + to add skills
                  </p>
                )}
              </div>
            </div>

            {/* Desired Roles Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Desired Roles <span className="text-destructive text-sm">*</span>
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., Marketing Intern, Web Developer"
                    className="h-12"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRole();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={addRole}
                    disabled={loading}
                    size="lg"
                    className="h-12 px-4"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                {desiredRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {desiredRoles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="bg-nextstep-clay text-primary border border-primary/20 px-4 py-2 text-sm shadow-warm-sm"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {desiredRoles.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Press Enter or click + to add roles
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base"
            >
              {loading ? (
                "Creating your account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 px-8 pb-8 border-t border-border/50 pt-6">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/student/login"
              className="text-primary font-semibold hover:text-primary-hover transition-colors"
            >
              Login
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link
              to="/"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentSignup;
