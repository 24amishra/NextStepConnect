import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingBusinesses, approveBusiness, rejectBusiness, BusinessWithApprovalStatus } from "@/lib/firestore";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/emailNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  LogOut,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessWithApprovalStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      setError("");
      const businesses = await getPendingBusinesses();
      setPendingBusinesses(businesses);
    } catch (err) {
      console.error("Error fetching pending businesses:", err);
      setError("Failed to load pending businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPendingBusinesses();
    }
  }, [authLoading]);

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError("");

      // Find the business data
      const business = pendingBusinesses.find((b) => b.userId === userId);
      if (!business) {
        throw new Error("Business not found");
      }

      // Approve in database
      await approveBusiness(userId);

      // Send approval email notification
      await sendApprovalEmail({
        businessName: business.companyName,
        contactEmail: business.email,
        contactPersonName: business.contactPersonName,
      });

      // Remove from pending list
      setPendingBusinesses((prev) => prev.filter((b) => b.userId !== userId));

      console.log(`Approved business: ${userId}`);
    } catch (err) {
      console.error("Error approving business:", err);
      setError("Failed to approve business");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError("");

      // Find the business data
      const business = pendingBusinesses.find((b) => b.userId === userId);
      if (!business) {
        throw new Error("Business not found");
      }

      // Reject in database
      await rejectBusiness(userId);

      // Send rejection email notification
      await sendRejectionEmail({
        businessName: business.companyName,
        contactEmail: business.email,
        contactPersonName: business.contactPersonName,
      });

      // Remove from pending list
      setPendingBusinesses((prev) => prev.filter((b) => b.userId !== userId));

      console.log(`Rejected business: ${userId}`);
    } catch (err) {
      console.error("Error rejecting business:", err);
      setError("Failed to reject business");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-heading text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingBusinesses}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline">{currentUser?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Card */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-primary" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Review and approve or reject business registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {pendingBusinesses.length} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pending Businesses List */}
          {pendingBusinesses.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  There are no pending business registrations at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingBusinesses.map((business) => (
                <Card key={business.userId} className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-primary/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <Building2 className="h-5 w-5 text-primary" />
                          {business.companyName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Registration ID: {business.userId.substring(0, 8)}...
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Building2 className="h-4 w-4 text-primary" />
                          Company Name
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.companyName}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          Location
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.location}</p>
                      </div>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Industry
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground">{business.industry}</p>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <User className="h-4 w-4 text-primary" />
                          Contact Person
                        </div>
                        <p className="text-base font-semibold text-foreground">{business.contactPersonName}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </div>
                        <p className="text-sm text-foreground">{business.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone
                      </div>
                      <p className="text-sm text-foreground">{business.phone}</p>
                    </div>

                    <Separator className="bg-primary/20" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Project Needs
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground">{business.potentialProblems}</p>
                    </div>

                    {business.categories && business.categories.length > 0 && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Categories
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {business.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {business.createdAt && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="text-xs text-muted-foreground">
                          Registered:{" "}
                          {business.createdAt?.toDate
                            ? new Date(business.createdAt.toDate()).toLocaleString()
                            : new Date(business.createdAt).toLocaleString()}
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-primary/20">
                      <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(business.userId)}
                        disabled={processingId === business.userId}
                      >
                        {processingId === business.userId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(business.userId)}
                        disabled={processingId === business.userId}
                      >
                        {processingId === business.userId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
