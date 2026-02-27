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
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Card className="border-0 shadow-warm-md bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              Your Matched Students
              {students.length > 0 && (
                <Badge className="bg-primary hover:bg-primary/90">
                  {students.length} Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-primary dark:text-primary/80">
              Students approved for partnerships - ready to contact!
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">No matched students yet</p>
            <p className="text-sm text-muted-foreground">
              Students will appear here when you accept their applications
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {students.map((student, index) => (
              <div key={student.userId}>
                {index > 0 && <Separator className="bg-primary/20 my-6" />}

                <div className="bg-card border-2 border-primary/20 rounded-lg p-6 space-y-4 hover:border-primary/40 transition-all">
                  {/* Student Header with Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">
                            {student.name}
                          </h3>
                          <Badge className="bg-primary hover:bg-primary/90 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium">{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => window.location.href = `mailto:${student.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    {student.linkedinUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => window.open(student.linkedinUrl, '_blank')}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                  </div>

                  <Separator className="bg-primary/20" />

                  {/* Bio */}
                  {student.bio && (
                    <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        About
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{student.bio}</p>
                    </div>
                  )}

                  {/* Skills & Roles Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Award className="h-4 w-4 text-primary" />
                          Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Interested In
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                  </div>
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
