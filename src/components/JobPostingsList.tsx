import { useEffect, useState } from "react";
import { getAllBusinessesWithBadges, getApplicationsForStudent, Application } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CategorySelector from "./CategorySelector";
import {
  Briefcase,
  MapPin,
  Building2,
  FileText,
  Loader2,
  Mail,
  Phone,
  Search,
  Award,
  X
} from "lucide-react";
import ApplicationForm from "./ApplicationForm";

const JobPostingsList = () => {
  const { currentUser } = useAuth();
  const [allBusinesses, setAllBusinesses] = useState<Array<any>>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError("");
        const businesses = await getAllBusinessesWithBadges();
        console.log(businesses);

        setAllBusinesses(businesses);
        setFilteredBusinesses(businesses);
      } catch (err) {
        console.error("Error fetching businesses:", err);
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch student's applications
  useEffect(() => {
    const fetchStudentApplications = async () => {
      if (currentUser?.uid) {
        try {
          const applications = await getApplicationsForStudent(currentUser.uid);
          setStudentApplications(applications);
        } catch (err) {
          console.error("Error fetching student applications:", err);
        }
      }
    };

    fetchStudentApplications();
  }, [currentUser?.uid]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allBusinesses];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((business) => {
        return (
          business.companyName.toLowerCase().includes(query) ||
          business.location.toLowerCase().includes(query) ||
          business.industry.toLowerCase().includes(query) ||
          business.potentialProblems.toLowerCase().includes(query)
        );
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((business) => {
        if (!business.categories || business.categories.length === 0) return false;
        return selectedCategories.some((cat) => business.categories.includes(cat));
      });
    }

    setFilteredBusinesses(filtered);
  }, [searchQuery, selectedCategories, allBusinesses]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const handleApply = (business: any) => {
    setSelectedBusiness(business);
    setApplicationOpen(true);
  };

  const hasApplied = (businessId: string) => {
    return studentApplications.some(app => app.businessId === businessId);
  };

  const getApplicationStatus = (businessId: string) => {
    const application = studentApplications.find(app => app.businessId === businessId);
    return application?.status || null;
  };

  const handleApplicationSuccess = async () => {
    // Refresh the student's applications after submitting a new one
    if (currentUser?.uid) {
      try {
        const applications = await getApplicationsForStudent(currentUser.uid);
        setStudentApplications(applications);
      } catch (err) {
        console.error("Error refreshing applications:", err);
      }
    }
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

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategories.length > 0;

  if (allBusinesses.length === 0 && !loading) {
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <Card className="border-primary/20 h-fit lg:sticky lg:top-24">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="h-4 w-4 inline mr-1" />
                Search
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Company, location, needs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Separator className="bg-primary/20" />

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <CategorySelector
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
                mode="filter"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opportunities List */}
        <div className="lg:col-span-3">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Briefcase className="h-5 w-5 text-primary" />
                Available Opportunities
              </CardTitle>
              <CardDescription>
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "opportunity" : "opportunities"} found
                {hasActiveFilters && " (filtered)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {filteredBusinesses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">
                    No opportunities match your filters
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredBusinesses.map((business, index) => (
                  <div
                    key={`${business.companyName}-${index}`}
                    className="border border-primary/20 rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all bg-card"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{business.companyName}</h3>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Active
                          </Badge>
                          {business.badge === "frequent" && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Award className="h-3 w-3 mr-1" />
                              Frequent Partner
                            </Badge>
                          )}
                          {business.badge === "returning" && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              <Award className="h-3 w-3 mr-1" />
                              Returning Member
                            </Badge>
                          )}
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

                      {business.categories && business.categories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {business.categories.map((category: string) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className="text-xs bg-primary/5 border-primary/20"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

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
                      {hasApplied(business.businessId) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-primary/50 text-primary"
                        >
                          ✓ Applied
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleApply(business)}
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedBusiness && (
        <ApplicationForm
          business={selectedBusiness}
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
};

export default JobPostingsList;