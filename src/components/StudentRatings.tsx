import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRatingsForStudent, Rating } from "@/lib/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Loader2, MessageSquare } from "lucide-react";

const StudentRatings = () => {
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState({
    overall: 0,
    communication: 0,
    professionalism: 0,
    skillQuality: 0,
  });

  useEffect(() => {
    const fetchRatings = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        const studentRatings = await getRatingsForStudent(currentUser.uid);
        setRatings(studentRatings);

        // Calculate averages
        if (studentRatings.length > 0) {
          const totals = studentRatings.reduce(
            (acc, rating) => ({
              overall: acc.overall + rating.overallRating,
              communication: acc.communication + rating.communicationRating,
              professionalism: acc.professionalism + rating.professionalismRating,
              skillQuality: acc.skillQuality + rating.skillQualityRating,
            }),
            { overall: 0, communication: 0, professionalism: 0, skillQuality: 0 }
          );

          setAverages({
            overall: totals.overall / studentRatings.length,
            communication: totals.communication / studentRatings.length,
            professionalism: totals.professionalism / studentRatings.length,
            skillQuality: totals.skillQuality / studentRatings.length,
          });
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [currentUser?.uid]);

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-primary text-primary"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-semibold text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-primary" />
            Your Ratings
          </CardTitle>
          <CardDescription>Feedback from businesses you've worked with</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No ratings yet. Complete projects to receive feedback!
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
          <Star className="h-5 w-5 text-primary" />
          Your Ratings
        </CardTitle>
        <CardDescription>
          Based on {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Average Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Overall Rating</p>
            <StarDisplay rating={averages.overall} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Communication</p>
            <StarDisplay rating={averages.communication} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Professionalism & Reliability
            </p>
            <StarDisplay rating={averages.professionalism} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Skill & Quality of Work
            </p>
            <StarDisplay rating={averages.skillQuality} />
          </div>
        </div>

        <Separator className="bg-primary/20" />

        {/* Individual Feedback */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Written Feedback
          </h3>
          {ratings
            .filter((rating) => rating.feedback)
            .map((rating, index) => (
              <Card key={rating.id || index} className="border-primary/10 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StarDisplay rating={rating.overallRating} />
                      <span className="text-xs text-muted-foreground">
                        {rating.createdAt?.toDate
                          ? new Date(rating.createdAt.toDate()).toLocaleDateString()
                          : new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground italic">"{rating.feedback}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          {ratings.filter((rating) => rating.feedback).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No written feedback yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentRatings;
