import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAssignedStudents, StudentProfile } from "@/lib/firestore";
import {
  Users,
  User,
  Mail,
  Award,
  Briefcase,
  Loader2,
  Link2,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface AssignedStudentsProps {
  businessId: string;
}

const AssignedStudents = ({ businessId }: AssignedStudentsProps) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        setError("");
        const assignedStudents = await getAssignedStudents(businessId);
        setStudents(assignedStudents);
      } catch (err) {
        setError("Failed to load assigned students");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchAssignedStudents();
    }
  }, [businessId]);

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Assigned Students
          </CardTitle>
          <CardDescription>Students matched to your business</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Assigned Students
        </CardTitle>
        <CardDescription>
          Students matched to your business ({students.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No students assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Students will appear here once they are matched to your business
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student, index) => (
              <div key={student.userId}>
                {index > 0 && <Separator className="bg-primary/20 my-4" />}

                <div className="space-y-4">
                  {/* Student Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${student.email}`}
                          className="hover:text-primary transition-colors truncate"
                        >
                          {student.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        About
                      </div>
                      <p className="text-sm text-foreground pl-6">{student.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Award className="h-4 w-4 text-primary" />
                        Skills
                      </div>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {student.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Desired Roles */}
                  {student.desiredRoles && student.desiredRoles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Desired Roles
                      </div>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {student.desiredRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="border-primary/30 text-foreground"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {student.linkedinUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Link2 className="h-4 w-4 text-primary" />
                        LinkedIn
                      </div>
                      <div className="pl-6">
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {student.linkedinUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignedStudents;
