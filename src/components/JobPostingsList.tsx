import { useEffect, useState } from "react";
import { getAllBusinesses, PublicBusinessData } from "@/lib/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  FileText, 
  Loader2,
  Mail,
  Phone
} from "lucide-react";
import ApplicationForm from "./ApplicationForm";

const JobPostingsList = () => {
  const [businesses, setBusinesses] = useState<PublicBusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<PublicBusinessData | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError("");
        const allBusinesses = await getAllBusinesses();
        console.log(allBusinesses);
        
        setBusinesses(allBusinesses);
        
      } catch (err) {
        console.error("Error fetching businesses:", err);
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleApply = (business: PublicBusinessData) => {
    setSelectedBusiness(business);
    setApplicationOpen(true);
  };

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

  if (error) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (businesses.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Briefcase className="h-5 w-5 text-primary" />
            Available Opportunities
          </CardTitle>
          <CardDescription>Current opportunities from businesses</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No opportunities available at the moment. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Briefcase className="h-5 w-5 text-primary" />
            Available Opportunities
          </CardTitle>
          <CardDescription>
            {businesses.length} {businesses.length === 1 ? "business" : "businesses"} looking for students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {businesses.map((business, index) => (
            <div
              key={`${business.companyName}-${index}`}
              className="border border-primary/20 rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{business.companyName}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      {business.location}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-primary/20 my-3" />

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Industry:</p>
                  <p className="text-sm text-foreground">{business.industry}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">What They Need:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                    {business.potentialProblems}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    {business.preferredContactMethod === "Email" ? business.email : "Contact via application"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleApply(business)}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedBusiness && (
        <ApplicationForm
          business={selectedBusiness}
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
        />
      )}
    </>
  );
};

export default JobPostingsList;