import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessData, BusinessData } from "@/lib/firestore";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface BusinessProtectedRouteProps {
  children: ReactNode;
}

export const BusinessProtectedRoute = ({ children }: BusinessProtectedRouteProps) => {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (authLoading) return;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getBusinessData(currentUser.uid);
        setBusinessData(data);
      } catch (err) {
        setError("Failed to load business data");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [currentUser, authLoading]);

  // Poll for approval status updates every 10 seconds when status is pending
  useEffect(() => {
    if (!currentUser || !businessData || businessData.approvalStatus !== "pending") {
      return;
    }

    const checkApprovalStatus = async () => {
      try {
        const data = await getBusinessData(currentUser.uid);
        if (data && data.approvalStatus !== businessData.approvalStatus) {
          // Status changed, update the state to trigger re-render
          setBusinessData(data);
        }
      } catch (err) {
        // Silently fail - we'll retry on next interval
      }
    };

    // Check every 10 seconds
    const intervalId = setInterval(checkApprovalStatus, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser, businessData]);

  // Show loading spinner while checking auth
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to home if not logged in
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to signup if no business profile found
  if (!businessData) {
    return <Navigate to="/business/signup" replace />;
  }

  // Check approval status
  const approvalStatus = businessData.approvalStatus || "pending";

  // If pending, show waiting message
  if (approvalStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4">
        <Card className="w-full max-w-2xl shadow-warm-lg border-0 rounded-3xl">
          <CardHeader className="text-center space-y-4 pb-6 pt-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-heading">
              Account Under Review
            </CardTitle>
            <CardDescription className="text-base">
              Thank you for registering with NextStep!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-foreground">
                Your business account is currently being reviewed by our admin team.
                This process typically takes 1-2 business days. This page automatically checks for updates every 10 seconds.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What happens next?</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Our team will review your business information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email notification once approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>After approval, you'll have full access to student profiles and applications</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Questions? Contact us at{" "}
                <a href="mailto:nextstep.connects@gmail.com" className="text-primary hover:underline">
                  nextstep.connects@gmail.com
                </a>
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                >
                  Refresh Status
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If rejected, show rejection message
  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4">
        <Card className="w-full max-w-2xl shadow-warm-lg border-0 rounded-3xl">
          <CardHeader className="text-center space-y-4 pb-6 pt-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-heading">
              Application Not Approved
            </CardTitle>
            <CardDescription className="text-base">
              Unfortunately, we're unable to approve your business account at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your business registration has been reviewed and we're unable to approve it at this time.
                This may be due to incomplete information or business verification requirements.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What can you do?</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Contact our support team for more information about the rejection</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Provide additional verification or documentation if requested</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Reapply with updated information if circumstances have changed</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                For assistance, please contact:{" "}
                <a href="mailto:support@nextstep.com" className="text-primary hover:underline">
                nextstep.connects@gmail.com

                </a>
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If approved, render the protected content
  return <>{children}</>;
};
