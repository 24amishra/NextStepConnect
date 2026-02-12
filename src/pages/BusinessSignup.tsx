import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveBusinessData } from "@/lib/firestore";
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
import { AlertCircle, Tags } from "lucide-react";
import CategorySelector from "@/components/CategorySelector";

const BusinessSignup = () => {
  const [step, setStep] = useState<"account" | "details">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Business details form
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
  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, skip to details step
  useEffect(() => {
    if (!authLoading && currentUser) {
      setStep("details");
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
      setStep("details");
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

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName || !location || !industry || !contactPersonName || !contactEmail || !phone || !potentialProblems) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
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

      navigate("/business/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to save business details");
      } else {
        setError("Failed to save business details");
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === "account") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Business Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your business account
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
                  placeholder="business@example.com"
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
              <Link to="/business/login" className="text-primary hover:underline">
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
          <CardTitle className="text-2xl font-bold text-center">Business Details</CardTitle>
          <CardDescription className="text-center">
            Please provide some information about your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Location (City, State/Province) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">
                Industry/What They Do <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="industry"
                placeholder="Describe your industry and what your company does"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                disabled={loading}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">
                Contact Person Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPersonName"
                type="text"
                placeholder="Enter contact person's name"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>
                Preferred Contact Method <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={preferredContactMethod}
                onValueChange={(value: "Email" | "Phone") => setPreferredContactMethod(value)}
                disabled={loading}
                required
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Email" id="email-contact" />
                  <Label htmlFor="email-contact" className="font-normal cursor-pointer">
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Phone" id="phone-contact" />
                  <Label htmlFor="phone-contact" className="font-normal cursor-pointer">
                    Phone
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="potentialProblems">
                Potential Problems/Needs <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="potentialProblems"
                placeholder="Describe your project needs and problems to be solved"
                value={potentialProblems}
                onChange={(e) => setPotentialProblems(e.target.value)}
                required
                disabled={loading}
                rows={5}
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
                selectedCategories={categories}
                onChange={setCategories}
                disabled={loading}
              />
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

export default BusinessSignup;
