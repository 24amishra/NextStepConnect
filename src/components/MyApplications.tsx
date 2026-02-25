import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApplicationsForStudent, getBusinessData, Application, BusinessData } from "@/lib/firestore";
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";

interface MyApplicationsProps {
  studentId: string;
}

interface ApplicationWithBusiness extends Application {
  business?: BusinessData;
}

const MyApplications = ({ studentId }: MyApplicationsProps) => {
  const [applications, setApplications] = useState<ApplicationWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");
        const apps = await getApplicationsForStudent(studentId);

        // Fetch business data for each application
        const appsWithBusiness = await Promise.all(
          apps.map(async (app) => {
            try {
              const business = await getBusinessData(app.businessId);
              return { ...app, business };
            } catch (err) {
              console.error(`Error fetching business ${app.businessId}:`, err);
              return app;
            }
          })
        );

        // Sort by most recent first
        appsWithBusiness.sort((a, b) => {
          const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
          const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
          return dateB.getTime() - dateA.getTime();
        });

        setApplications(appsWithBusiness);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchApplications();
    }
  }, [studentId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "rated":
        return (
          <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
            <Star className="h-3 w-3 mr-1 fill-primary" />
            Rated
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Not Selected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            My Applications
          </CardTitle>
          <CardDescription>Track the status of your applications</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-1">No applications yet</p>
            <p className="text-sm text-muted-foreground">
              Browse opportunities and apply to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          My Applications
        </CardTitle>
        <CardDescription>
          You have {applications.length} {applications.length === 1 ? 'application' : 'applications'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {app.business?.companyName || app.businessName}
                    </h3>
                    {app.business?.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {app.business.location}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(app.status || "pending")}
                </div>

                <Separator className="bg-primary/20" />

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Applied: {formatDate(app.appliedAt)}</span>
                  </div>
                  {app.business?.industry && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="truncate">{app.business.industry}</span>
                    </div>
                  )}
                </div>

                {/* Status message */}
                {app.status === "pending" && (
                  <Alert className="bg-amber-500/5 border-amber-500/20">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      Your application is being reviewed. We'll notify you once there's an update.
                    </AlertDescription>
                  </Alert>
                )}
                {app.status === "completed" && (
                  <Alert className="bg-green-500/5 border-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      Congratulations! You successfully completed this project.
                    </AlertDescription>
                  </Alert>
                )}
                {app.status === "rated" && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Star className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      This project has been completed and rated. Check your ratings in the Profile section!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyApplications;
