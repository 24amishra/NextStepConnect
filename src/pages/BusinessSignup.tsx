import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { saveBusinessData } from "@/lib/firestore";
import { sendAdminNotification, sendBusinessWelcomeEmail } from "@/lib/emailNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, Lock, Building2, MapPin, User, Phone, Briefcase, ArrowRight, CheckCircle2, Sparkles, Tags } from "lucide-react";
import CategorySelector from "@/components/CategorySelector";
import { motion } from "framer-motion";

const BusinessSignup = () => {
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
        navigate("/business/login");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

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

      if (!companyName.trim()) {
        setError("Please enter your company name");
        return;
      }
      if (!location.trim()) {
        setError("Please enter your location");
        return;
      }
      if (!industry.trim()) {
        setError("Please describe your industry");
        return;
      }
      if (!contactPersonName.trim()) {
        setError("Please enter the contact person's name");
        return;
      }
      if (!contactEmail || !/\S+@\S+\.\S+/.test(contactEmail)) {
        setError("Please enter a valid contact email address");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter a phone number");
        return;
      }
      if (!potentialProblems.trim()) {
        setError("Please describe your project needs");
        return;
      }

      // Create account if not already logged in
      if (!currentUser) {
        await signup(email, password);
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      await saveBusinessData({
        userId: user.uid,
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
        businessId: user.uid,
      });

      sendBusinessWelcomeEmail({
        to_email: contactEmail,
        to_name: contactPersonName,
        company_name: companyName,
      }).catch((err) => console.error("Business welcome email failed:", err));

      sendAdminNotification({
        businessName: companyName,
        contactEmail: contactEmail,
        contactPersonName: contactPersonName,
      }).catch((err) => console.error("Admin notification failed:", err));

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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-nextstep-brick/10 via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-nextstep-brick/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-gradient-to-br from-nextstep-brick/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-nextstep-brick/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-nextstep-brick/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-36 h-36 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-2xl shadow-warm-lg border-0 rounded-3xl overflow-hidden relative z-10">
        <CardContent className="px-8 py-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-heading">Welcome to NextStep</h2>
            <p className="text-muted-foreground">Register your business</p>
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
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
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

            {/* Company Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Details
              </h3>
              <div className="space-y-4 pl-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Acme Inc."
                        className="pl-12 h-12"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="San Francisco, CA"
                        className="pl-12 h-12"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Industry <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="We're a tech startup building innovative AI solutions for healthcare..."
                    className="min-h-[100px] resize-none"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-4 pl-7">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                    <Input
                      id="contactPersonName"
                      type="text"
                      placeholder="Jane Smith"
                      className="pl-12 h-12"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@example.com"
                        className="pl-12 h-12"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-12 h-12"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup
                    value={preferredContactMethod}
                    onValueChange={(value: "Email" | "Phone") => setPreferredContactMethod(value)}
                    disabled={loading}
                    className="flex gap-4"
                  >
                    <div
                      className={`flex items-center space-x-2 p-4 border-2 rounded-xl cursor-pointer transition-all flex-1 ${
                        preferredContactMethod === "Email"
                          ? "border-primary bg-nextstep-clay/60 shadow-warm-sm"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                      onClick={() => setPreferredContactMethod("Email")}
                    >
                      <RadioGroupItem value="Email" id="email-contact" />
                      <Label htmlFor="email-contact" className="font-medium cursor-pointer flex-1">
                        Email
                      </Label>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div
                      className={`flex items-center space-x-2 p-4 border-2 rounded-xl cursor-pointer transition-all flex-1 ${
                        preferredContactMethod === "Phone"
                          ? "border-primary bg-nextstep-clay/60 shadow-warm-sm"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                      onClick={() => setPreferredContactMethod("Phone")}
                    >
                      <RadioGroupItem value="Phone" id="phone-contact" />
                      <Label htmlFor="phone-contact" className="font-medium cursor-pointer flex-1">
                        Phone
                      </Label>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Project Needs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Project Needs
              </h3>
              <div className="space-y-4 pl-7">
                <div className="space-y-2">
                  <Label>What do you need help with? <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="We're looking for help with social media marketing, content creation, and community engagement..."
                    className="min-h-[120px] resize-none"
                    value={potentialProblems}
                    onChange={(e) => setPotentialProblems(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <Tags className="h-5 w-5 text-primary" />
                Project Categories <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </h3>
              <div className="pl-7">
                <CategorySelector
                  selectedCategories={categories}
                  onChange={setCategories}
                  disabled={loading}
                />
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
                  Register Business
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
      </Card>
    </div>
  );
};

export default BusinessSignup;
