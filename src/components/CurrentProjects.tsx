import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApplicationsForStudent, getBusinessData, Application, BusinessData } from "@/lib/firestore";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface CurrentProjectsProps {
  studentId: string;
}

interface ApplicationWithBusiness extends Application {
  business?: BusinessData;
}

const CurrentProjects = ({ studentId }: CurrentProjectsProps) => {
  const [projects, setProjects] = useState<ApplicationWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentProjects = async () => {
      try {
        setLoading(true);
        setError("");
        const apps = await getApplicationsForStudent(studentId);

        // Filter only accepted applications
        const acceptedApps = apps.filter(app => app.status === "accepted");

        // Fetch business data for each accepted application
        const projectsWithBusiness = await Promise.all(
          acceptedApps.map(async (app) => {
            try {
              const business = await getBusinessData(app.businessId);
              return { ...app, business };
            } catch (err) {
              return app;
            }
          })
        );

        // Sort by most recently accepted first
        projectsWithBusiness.sort((a, b) => {
          const dateA = a.acceptedAt?.toDate ? a.acceptedAt.toDate() : new Date(a.acceptedAt || 0);
          const dateB = b.acceptedAt?.toDate ? b.acceptedAt.toDate() : new Date(b.acceptedAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setProjects(projectsWithBusiness);
      } catch (err) {
        setError("Failed to load current projects");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchCurrentProjects();
    }
  }, [studentId]);

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
      <Card className="border-0 shadow-warm-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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

  if (projects.length === 0) {
    return null; // Don't show anything if there are no current projects
  }

  return (
    <Card className="border-0 shadow-warm-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              Current Projects
              <Badge className="bg-green-600 hover:bg-green-700">
                {projects.length} Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-400">
              Your accepted applications are now live projects!
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border-2 border-green-200 dark:border-green-800 rounded-lg p-6 hover:border-green-300 dark:hover:border-green-700 transition-all shadow-sm"
            >
              <div className="space-y-4">
                {/* Header with status badge */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-green-600" />
                      {project.business?.companyName || project.businessName}
                    </h3>
                    {project.business?.location && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        {project.business.location}
                      </div>
                    )}
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                </div>

                <Separator className="bg-green-200 dark:bg-green-800" />

                {/* Success message */}
                <Alert className="bg-green-500/10 border-green-500/30">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm font-medium text-green-700 dark:text-green-400">
                    Congratulations! This business has accepted your application. Contact them to get started on your project.
                  </AlertDescription>
                </Alert>

                {/* Project info */}
                {project.business?.potentialProblems && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      Project Details
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {project.business.potentialProblems}
                    </p>
                  </div>
                )}

                <Separator className="bg-green-200 dark:bg-green-800" />

                {/* Contact Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                      <p className="font-semibold text-foreground">
                        {project.business?.contactPersonName || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${project.business?.email}`}
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 text-sm"
                      >
                        <Mail className="h-3 w-3" />
                        {project.business?.email || "N/A"}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${project.business?.phone}`}
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {project.business?.phone || "N/A"}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Preferred Contact</p>
                      <p className="font-semibold text-foreground">
                        {project.business?.preferredContactMethod || "Email"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Applied: {formatDate(project.appliedAt)}</span>
                  </div>
                  {project.acceptedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Accepted: {formatDate(project.acceptedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProjects;
