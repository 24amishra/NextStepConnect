import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAssignedStudentsGroupedByOpportunity, OpportunityWithStudents } from "@/lib/firestore";
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
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignedStudentsProps {
  businessId: string;
}

const AssignedStudents = ({ businessId }: AssignedStudentsProps) => {
  const [opportunitiesWithStudents, setOpportunitiesWithStudents] = useState<OpportunityWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAssignedStudentsGroupedByOpportunity(businessId);
        setOpportunitiesWithStudents(data);
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

  const totalStudents = opportunitiesWithStudents.reduce((sum, opp) => sum + opp.students.length, 0);

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
              {totalStudents > 0 && (
                <Badge className="bg-primary hover:bg-primary/90">
                  {totalStudents} Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-primary dark:text-primary/80">
              Students assigned to your opportunities - ready to contact!
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

        {opportunitiesWithStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">No students assigned to any opportunities yet</p>
            <p className="text-sm text-muted-foreground">
              Students will appear here when you accept their applications
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {opportunitiesWithStudents.map((oppData) => (
              <Card key={oppData.opportunity.id} className="border-2 border-primary/30 bg-card">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{oppData.opportunity.title}</CardTitle>
                        <Badge className="bg-primary hover:bg-primary/90">
                          {oppData.students.length} {oppData.students.length === 1 ? 'Student' : 'Students'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {oppData.opportunity.description}
                      </CardDescription>
                    </div>
                  </div>
                  {/* Opportunity Categories */}
                  {oppData.opportunity.categories && oppData.opportunity.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {oppData.opportunity.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="bg-primary/10 text-primary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {oppData.students.map((student, index) => (
                      <div key={student.userId}>
                        {index > 0 && <Separator className="bg-primary/20 my-6" />}

                        <div className="bg-muted/30 border border-primary/10 rounded-lg p-5 space-y-4 hover:border-primary/30 transition-all">
                          {/* Student Header with Badge */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-foreground">
                                    {student.name}
                                  </h3>
                                  <Badge variant="outline" className="border-primary text-primary">
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
                              onClick={() => window.location.href = `mailto:${student.email}?subject=${oppData.opportunity.title}`}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Email about this opportunity
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

                          {/* Bio */}
                          {student.bio && (
                            <div className="space-y-2 bg-card p-4 rounded-lg border border-primary/10">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignedStudents;
