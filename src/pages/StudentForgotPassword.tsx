import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, CheckCircle } from "lucide-react";

const StudentForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to send reset email");
      } else {
        setError("Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

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

      <Card className="w-full max-w-md shadow-warm-lg border-0 rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <CardTitle className="text-3xl font-bold text-center font-heading">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-base text-muted-foreground">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          {success ? (
            <Alert className="rounded-xl border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Check your inbox for a password reset link. You may need to check your spam folder.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    className="pl-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 px-8 pb-8">
          <div className="text-sm text-center text-muted-foreground">
            <Link to="/student/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Back to Login
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground pt-2 border-t border-border/50">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
              &larr; Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentForgotPassword;
