import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStudentProfile, getRatingsForStudent, StudentProfile, Rating } from "@/lib/firestore";
import { Loader2, Mail, Star, ExternalLink, User, Briefcase, Award } from "lucide-react";

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentEmail: string;
  studentName: string;
}

const StudentDetailsDialog = ({
  open,
  onOpenChange,
  studentId,
  studentEmail,
  studentName,
}: StudentDetailsDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!open || !studentId) return;

      try {
        setLoading(true);

        // Fetch profile and ratings in parallel
        const [studentProfile, studentRatings] = await Promise.all([
          getStudentProfile(studentId),
          getRatingsForStudent(studentId),
        ]);

        setProfile(studentProfile);
        setRatings(studentRatings);

        // Calculate average rating
        if (studentRatings.length > 0) {
          const avg =
            studentRatings.reduce((sum, r) => sum + r.overallRating, 0) / studentRatings.length;
          setAverageRating(avg);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [open, studentId]);

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {studentName}
          </DialogTitle>
          <DialogDescription>Student profile and reviews</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{studentEmail}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.open(`mailto:${studentEmail}`, "_blank")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Student Profile */}
            {profile && (
              <>
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                    <CardTitle className="text-base">Skills & Desired Roles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
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

                    <Separator className="bg-primary/20" />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Desired Roles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.desiredRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="bg-primary/5 border-primary/20"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {profile.bio && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            About / Strengths
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                      </>
                    )}

                    {profile.linkedinUrl && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(profile.linkedinUrl, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            LinkedIn Profile
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Past Reviews */}
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Past Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {ratings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No reviews yet
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <span className="text-sm font-medium text-foreground">
                            Average Rating
                          </span>
                          <StarDisplay rating={averageRating} />
                        </div>

                        <Separator className="bg-primary/20" />

                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            {ratings.length} {ratings.length === 1 ? "Review" : "Reviews"}
                          </p>
                          {ratings.map((rating, index) => (
                            <div
                              key={rating.id || index}
                              className="p-3 rounded-lg border border-primary/10 bg-card space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <StarDisplay rating={rating.overallRating} />
                                <span className="text-xs text-muted-foreground">
                                  {rating.createdAt?.toDate
                                    ? new Date(rating.createdAt.toDate()).toLocaleDateString()
                                    : new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {rating.feedback && (
                                <p className="text-sm text-foreground italic">"{rating.feedback}"</p>
                              )}
                              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Communication:</span>{" "}
                                  <span className="font-semibold">{rating.communicationRating}/5</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Professional:</span>{" "}
                                  <span className="font-semibold">{rating.professionalismRating}/5</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Quality:</span>{" "}
                                  <span className="font-semibold">{rating.skillQualityRating}/5</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!profile && (
              <Card className="border-primary/20">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    This student hasn't completed their profile yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;
