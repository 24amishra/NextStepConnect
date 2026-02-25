import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveBusinessData } from "@/lib/firestore";
import { sendAdminNotification } from "@/lib/emailNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Tags, Mail, Lock, Building2, MapPin, User, Phone, Briefcase, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import CategorySelector from "@/components/CategorySelector";
import { motion, AnimatePresence } from "framer-motion";

// Step type definition
type Step =
  | "email"
  | "password"
  | "confirmPassword"
  | "companyName"
  | "location"
  | "industry"
  | "contactPerson"
  | "contactEmail"
  | "phone"
  | "contactMethod"
  | "problems"
  | "categories"
  | "complete";

const TOTAL_STEPS = 12;

const BusinessSignup = () => {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [direction, setDirection] = useState(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"Email" | "Phone">("Email");
  const [potentialProblems, setPotentialProblems] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Step mapping for progress
  const stepOrder: Step[] = [
    "email",
    "password",
    "confirmPassword",
    "companyName",
    "location",
    "industry",
    "contactPerson",
    "contactEmail",
    "phone",
    "contactMethod",
    "problems",
    "categories",
    "complete",
  ];

  const getCurrentStepIndex = () => stepOrder.indexOf(currentStep);
  const getProgressPercentage = () =>
    ((getCurrentStepIndex() + 1) / TOTAL_STEPS) * 100;

  // If user is already logged in, skip to business details
  useEffect(() => {
    if (!authLoading && currentUser) {
      setCurrentStep("companyName");
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

        case "companyName":
          if (!companyName.trim()) {
            setError("Please enter your company name");
            return;
          }
          break;

        case "location":
          if (!location.trim()) {
            setError("Please enter your location");
            return;
          }
          break;

        case "industry":
          if (!industry.trim()) {
            setError("Please describe your industry");
            return;
          }
          break;

        case "contactPerson":
          if (!contactPersonName.trim()) {
            setError("Please enter the contact person's name");
            return;
          }
          break;

        case "contactEmail":
          if (!contactEmail || !/\S+@\S+\.\S+/.test(contactEmail)) {
            setError("Please enter a valid email address");
            return;
          }
          break;

        case "phone":
          if (!phone.trim()) {
            setError("Please enter a phone number");
            return;
          }
          break;

        case "problems":
          if (!potentialProblems.trim()) {
            setError("Please describe your project needs");
            return;
          }
          break;

        case "categories":
          // Save business data and complete
          if (!currentUser) {
            throw new Error("User not authenticated");
          }

          await saveBusinessData({
            userId: currentUser.uid,
            companyName,
            location,
            industry,
            contactPersonName,
            email: contactEmail,
            phone,
            preferredContactMethod,
            potentialProblems,
            categories,
            createdAt: new Date(),
            businessId: currentUser.uid,
          });

          // Send admin notification about new registration
          try {
            await sendAdminNotification({
              businessName: companyName,
              contactEmail: contactEmail,
              contactPersonName: contactPersonName,
            });
          } catch (emailError) {
            // Don't fail the signup if email fails
            console.error("Failed to send admin notification:", emailError);
          }
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

  // Complete signup and redirect to login after a delay
  useEffect(() => {
    if (currentStep === "complete") {
      const timer = setTimeout(() => {
        navigate("/business/login");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate]);

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
              <h2 className="text-3xl font-bold font-heading">Welcome to NextStep</h2>
              <p className="text-muted-foreground">What's your business email?</p>
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
                  placeholder="business@example.com"
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
              <p className="text-muted-foreground">Keep your account secure</p>
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
              <p className="text-muted-foreground">Type it one more time</p>
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

      case "companyName":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What's your company name?</h2>
              <p className="text-muted-foreground">Help students know who you are</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className={`transition-all duration-200 ${
                  focusedField || companyName ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  className="pl-12 h-14 text-lg"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Where are you located?</h2>
              <p className="text-muted-foreground">City, State/Province</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className={`transition-all duration-200 ${
                  focusedField || location ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="location"
                  type="text"
                  placeholder="San Francisco, CA"
                  className="pl-12 h-14 text-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "industry":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What industry are you in?</h2>
              <p className="text-muted-foreground">Tell us what your company does</p>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="We're a tech startup building innovative AI solutions for healthcare..."
                className="min-h-[120px] text-lg resize-none"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case "contactPerson":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Who should we contact?</h2>
              <p className="text-muted-foreground">Name of the main contact person</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="contactPersonName"
                className={`transition-all duration-200 ${
                  focusedField || contactPersonName ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Contact Person Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="contactPersonName"
                  type="text"
                  placeholder="Jane Smith"
                  className="pl-12 h-14 text-lg"
                  value={contactPersonName}
                  onChange={(e) => setContactPersonName(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "contactEmail":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Contact email</h2>
              <p className="text-muted-foreground">Where can students reach you?</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="contactEmail"
                className={`transition-all duration-200 ${
                  focusedField || contactEmail ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  className="pl-12 h-14 text-lg"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "phone":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Phone number</h2>
              <p className="text-muted-foreground">Best number to reach you</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className={`transition-all duration-200 ${
                  focusedField || phone ? "text-primary text-sm" : "text-muted-foreground"
                }`}
              >
                Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="pl-12 h-14 text-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedField(true)}
                  onBlur={() => setFocusedField(false)}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "contactMethod":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Preferred contact method</h2>
              <p className="text-muted-foreground">How should students reach out?</p>
            </div>
            <div className="space-y-4">
              <RadioGroup
                value={preferredContactMethod}
                onValueChange={(value: "Email" | "Phone") => setPreferredContactMethod(value)}
                disabled={loading}
                className="flex flex-col gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-6 border-2 rounded-2xl cursor-pointer transition-all shadow-warm-sm ${
                    preferredContactMethod === "Email"
                      ? "border-primary bg-nextstep-clay/60 shadow-warm-md"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  onClick={() => setPreferredContactMethod("Email")}
                >
                  <RadioGroupItem value="Email" id="email-contact" />
                  <Label htmlFor="email-contact" className="font-medium cursor-pointer text-lg flex-1">
                    Email
                  </Label>
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-6 border-2 rounded-2xl cursor-pointer transition-all shadow-warm-sm ${
                    preferredContactMethod === "Phone"
                      ? "border-primary bg-nextstep-clay/60 shadow-warm-md"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  onClick={() => setPreferredContactMethod("Phone")}
                >
                  <RadioGroupItem value="Phone" id="phone-contact" />
                  <Label htmlFor="phone-contact" className="font-medium cursor-pointer text-lg flex-1">
                    Phone
                  </Label>
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </RadioGroup>
            </div>
          </div>
        );

      case "problems":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">What do you need help with?</h2>
              <p className="text-muted-foreground">Describe your project needs and challenges</p>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="We're looking for help with social media marketing, content creation, and community engagement..."
                className="min-h-[140px] text-lg resize-none"
                value={potentialProblems}
                onChange={(e) => setPotentialProblems(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case "categories":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Project categories</h2>
              <p className="text-muted-foreground">Select all that apply (optional)</p>
            </div>
            <div className="space-y-4">
              <CategorySelector
                selectedCategories={categories}
                onChange={setCategories}
                disabled={loading}
              />
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  You can skip this step if none apply
                </p>
              )}
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
              <h2 className="text-4xl font-bold font-heading">Registration Complete!</h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Your account is under review.
              </p>
              <p className="text-muted-foreground mt-2 text-base">
                You'll be notified via email once your account is approved.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                This usually takes 1-2 business days.
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-nextstep-brick/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative Background Elements - Business Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-nextstep-brick/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-nextstep-brick/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-36 h-36 bg-primary/5 rounded-full blur-3xl"></div>
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
                      {currentStep === "categories" ? "Complete" : "Continue"}
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
                to="/business/login"
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

export default BusinessSignup;
