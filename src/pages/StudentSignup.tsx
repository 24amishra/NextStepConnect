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
import { AlertCircle, X, Plus, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Link2, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Step type definition
type Step =
  | "email"
  | "password"
  | "confirmPassword"
  | "name"
  | "skills"
  | "roles"
  | "pitch"
  | "portfolio"
  | "linkedin"
  | "complete";

const TOTAL_STEPS = 8;

const StudentSignup = () => {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Form fields
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
  const [focusedField, setFocusedField] = useState(false);

  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const MAX_PITCH_CHARS = 150;

  // Step mapping for progress
  const stepOrder: Step[] = [
    "email",
    "password",
    "confirmPassword",
    "name",
    "skills",
    "roles",
    "pitch",
    "linkedin",
    "complete",
  ];

  const getCurrentStepIndex = () => stepOrder.indexOf(currentStep);
  const getProgressPercentage = () =>
    ((getCurrentStepIndex() + 1) / TOTAL_STEPS) * 100;

  // If user is already logged in, skip to profile steps
  useEffect(() => {
    if (!authLoading && currentUser) {
      setCurrentStep("name");
      setEmail(currentUser.email || "");
    }
  }, [currentUser, authLoading]);

  // Navigation helpers
  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < stepOrder.length - 1) {
      setDirection(1);
      setCurrentStep(stepOrder[currentIndex + 1]);
      setError("");
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(stepOrder[currentIndex - 1]);
      setError("");
    }
  };

  // Validation and step handlers
  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      switch (currentStep) {
        case "email":
          if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            return;
          }
          break;

        case "password":
          if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
          }
          break;

        case "confirmPassword":
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }
          // Create account here
          await signup(email, password);
          break;

        case "name":
          if (!name.trim()) {
            setError("Please enter your full name");
            return;
          }
          break;

        case "skills":
          if (skills.length === 0) {
            setError("Please add at least one skill");
            return;
          }
          break;

        case "roles":
          if (desiredRoles.length === 0) {
            setError("Please add at least one desired role");
            return;
          }
          break;

        case "pitch":
          if (!elevatorPitch.trim()) {
            setError("Please write your elevator pitch");
            return;
          }
          if (elevatorPitch.length > MAX_PITCH_CHARS) {
            setError(`Elevator pitch must be ${MAX_PITCH_CHARS} characters or less`);
            return;
          }
          break;

        case "linkedin":
          // Save profile and complete
          if (!currentUser) {
            throw new Error("User not authenticated");
          }

          const profileData: any = {
            userId: currentUser.uid,
            name,
            email: currentUser.email || "",
            skills,
            desiredRoles,
            createdAt: new Date(),
          };

          // Only add optional fields if they have values
          if (elevatorPitch) {
            profileData.bio = elevatorPitch;
          }
          if (linkedinUrl) {
            profileData.linkedinUrl = linkedinUrl;
          }

          await saveStudentProfile(profileData);
          break;
      }

      goToNextStep();
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

  // Complete signup and redirect
  useEffect(() => {
    if (currentStep === "complete") {
      const timer = setTimeout(() => {
        navigate("/student/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate]);

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

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Render individual step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Let's get started</h2>
              <p className="text-muted-foreground">What's your email address?</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`transition-all duration-200 ${
                  focusedField || email ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-14 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Create a password</h2>
              <p className="text-muted-foreground">Choose a secure password</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`transition-all duration-200 ${
                  focusedField || password ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Password (minimum 6 characters)
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "confirmPassword":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Confirm your password</h2>
              <p className="text-muted-foreground">Type it again to be sure</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className={`transition-all duration-200 ${
                  focusedField || confirmPassword ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-14 text-lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "name":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What's your name?</h2>
              <p className="text-muted-foreground">Let businesses know who you are</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className={`transition-all duration-200 ${
                  focusedField || name ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-12 h-14 text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What are your skills?</h2>
              <p className="text-muted-foreground">Add skills that make you stand out</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., Graphic Design, Python, Photography"
                  className="h-14 text-lg"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  autoFocus
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  disabled={loading}
                  size="lg"
                  className="h-14 px-6"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              {skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-nextstep-clay text-primary border border-primary/20 px-4 py-2 text-base shadow-warm-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Press Enter or click + to add skills
                </p>
              )}
            </div>
          </div>
        );

      case "roles":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What roles interest you?</h2>
              <p className="text-muted-foreground">What kind of work are you looking for?</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., Marketing Intern, Web Developer"
                  className="h-14 text-lg"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRole();
                    }
                  }}
                  autoFocus
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={addRole}
                  disabled={loading}
                  size="lg"
                  className="h-14 px-6"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              {desiredRoles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {desiredRoles.map((role, index) => (
                    <motion.div
                      key={role}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-nextstep-clay text-primary border border-primary/20 px-4 py-2 text-base shadow-warm-sm"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {desiredRoles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Press Enter or click + to add roles
                </p>
              )}
            </div>
          </div>
        );

      case "pitch":
        const remainingChars = MAX_PITCH_CHARS - elevatorPitch.length;
        const isOverLimit = remainingChars < 0;

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Your elevator pitch</h2>
              <p className="text-muted-foreground">In one sentence, why should a business choose you?</p>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="I'm a creative problem-solver who brings fresh ideas and strong work ethic to every project."
                className="min-h-[120px] text-lg resize-none"
                value={elevatorPitch}
                onChange={(e) => setElevatorPitch(e.target.value)}
                autoFocus
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
          </div>
        );

      case "linkedin":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Connect on LinkedIn</h2>
              <p className="text-muted-foreground">Link to your LinkedIn profile (optional)</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="linkedinUrl"
                className={`transition-all duration-200 ${
                  focusedField || linkedinUrl ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                LinkedIn URL
              </Label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  className="pl-12 h-14 text-lg"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "complete":
        return (
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
        );

      default:
        return null;
    }
  };

  const canGoBack = getCurrentStepIndex() > 0 && currentStep !== "complete";
  const canGoForward = currentStep !== "complete";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-nextstep-clay/30 relative overflow-hidden">
      {/* Decorative Background Elements - Student Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-nextstep-clay/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-nextstep-clay/20 rounded-full blur-3xl"></div>
        {/* Accent dots pattern */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute bottom-1/2 left-1/4 w-2 h-2 bg-primary/20 rounded-full"></div>
      </div>

      <Card className="w-full max-w-lg shadow-warm-lg border-0 rounded-3xl overflow-hidden relative z-10">
        {/* Progress bar */}
        {currentStep !== "complete" && (
          <div className="h-1.5 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        )}

        <CardContent className="px-8 py-10">
          {/* Error alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step content with animation */}
          <div className="relative overflow-hidden min-h-[300px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                }}
                className="w-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {currentStep !== "complete" && (
            <div className="flex gap-3 mt-8">
              {canGoBack && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={goToPreviousStep}
                  disabled={loading}
                  className="h-14"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
              )}
              {canGoForward && (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 h-14 text-base"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      {currentStep === "linkedin" ? "Complete" : "Continue"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Step indicator */}
          {currentStep !== "complete" && (
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Step {getCurrentStepIndex() + 1} of {TOTAL_STEPS}
            </div>
          )}
        </CardContent>

        {currentStep !== "complete" && (
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
        )}
      </Card>
    </div>
  );
};

export default StudentSignup;
