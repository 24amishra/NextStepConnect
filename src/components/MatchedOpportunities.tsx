import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBusinessesAssignedToStudent, PublicBusinessData } from "@/lib/firestore";
import {
  Sparkles,
  Building2,
  MapPin,
  Briefcase,
  Loader2,
  AlertCircle,
  ArrowRight,
  Star
} from "lucide-react";

interface MatchedOpportunitiesProps {
  studentId: string;
}

const MatchedOpportunities = ({ studentId }: MatchedOpportunitiesProps) => {
  const [matchedBusinesses, setMatchedBusinesses] = useState<PublicBusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatchedBusinesses = async () => {
      try {
        setLoading(true);
        setError("");
        const businesses = await getBusinessesAssignedToStudent(studentId);
        setMatchedBusinesses(businesses);
      } catch (err) {
        console.error("Error fetching matched businesses:", err);
        setError("Failed to load matched opportunities");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchMatchedBusinesses();
    }
  }, [studentId]);

  if (loading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 shadow-warm-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  if (matchedBusinesses.length === 0) {
    return null; // Don't show anything if no matches
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 shadow-warm-md">
      <CardHeader className="border-b border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Star className="h-5 w-5 text-primary fill-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Matched Opportunities
            </CardTitle>
            <CardDescription className="mt-1">
              We've matched you with {matchedBusinesses.length} {matchedBusinesses.length === 1 ? 'organization' : 'organizations'} based on your skills and interests
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {matchedBusinesses.map((business) => (
            <Card key={business.businessId} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-primary">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Matched for You
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {business.companyName}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {business.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Briefcase className="h-4 w-4 text-primary" />
                      What They Do
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{business.industry}</p>
                  </div>

                  {/* Project Needs */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      What They Need Help With
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">{business.potentialProblems}</p>
                  </div>

                  {/* Categories */}
                  {business.categories && business.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {business.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="bg-primary/10 text-primary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-2">
                    <Alert className="bg-primary/5 border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        <strong>Great news!</strong> This organization is interested in working with you.
                        Reach out to them at{" "}
                        <a
                          href={`mailto:${business.email}`}
                          className="text-primary hover:underline font-semibold"
                        >
                          {business.email}
                        </a>
                        {" "}to get started!
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <a href={`mailto:${business.email}?subject=NextStep Match - ${business.companyName}`}>
                      Contact {business.companyName}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchedOpportunities;
