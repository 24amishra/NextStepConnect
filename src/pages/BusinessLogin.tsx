import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessData, BusinessData } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Building2, MapPin, Briefcase, User, Mail, Phone, Loader2 } from "lucide-react";

const BusinessLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);
  const { login, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch business data if user is already logged in
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) return;

    // Don't fetch if we've already fetched for this user
    if (currentUser?.uid === fetchedUserId) return;

    const fetchBusinessData = async () => {
      if (currentUser?.uid) {
        try {
          setLoadingData(true);
          const data = await getBusinessData(currentUser.uid);
          setBusinessData(data);
          setFetchedUserId(currentUser.uid);
        } catch (err) {
          console.error("Error fetching business data:", err);
          setFetchedUserId(currentUser.uid); // Set even on error to prevent infinite retries
        } finally {
          setLoadingData(false);
        }
      } else {
        setBusinessData(null);
        setFetchedUserId(null);
      }
    };

    fetchBusinessData();
  }, [currentUser?.uid, authLoading, fetchedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/business/dashboard"); // Redirect to business dashboard after login
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to log in");
      } else {
        setError("Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already logged in, show their business info
  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
        <div className="w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">You're Already Logged In</CardTitle>
              <CardDescription className="text-center">
                Welcome back, {currentUser.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate("/business/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {loadingData ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : businessData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Your Business Information
                </CardTitle>
                <CardDescription>
                  Data stored in Firestore: <code className="text-xs">businesses/{currentUser.uid}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Company Name
                    </div>
                    <p className="text-lg font-semibold">{businessData.companyName}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <p className="text-lg font-semibold">{businessData.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Industry / What You Do
                  </div>
                  <p className="text-base whitespace-pre-wrap">{businessData.industry}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Contact Person
                  </div>
                  <p className="text-lg font-semibold">{businessData.contactPersonName}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="text-base">{businessData.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <p className="text-base">{businessData.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Preferred Contact Method
                  </div>
                  <p className="text-base font-semibold">{businessData.preferredContactMethod}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Potential Problems / Needs
                  </div>
                  <p className="text-base whitespace-pre-wrap">{businessData.potentialProblems}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Business Profile Found</CardTitle>
                <CardDescription>
                  Your account exists but no business profile has been created yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/business/signup")} className="w-full">
                  Complete Your Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Business Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your business account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/business/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link to="/business/forgot-password" className="text-primary hover:underline">
              Forgot password?
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
};

export default BusinessLogin;
