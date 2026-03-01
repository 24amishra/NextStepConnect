import { useEffect, useState } from "react";
import { getAllBusinessesWithBadges, getAllActiveOpportunities, getApplicationsForStudent, Application, Opportunity } from "@/lib/firestore";
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
  const [allOpportunities, setAllOpportunities] = useState<Array<Opportunity>>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Array<Opportunity>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch active opportunities
        const opportunities = await getAllActiveOpportunities();

        // Fetch businesses for backward compatibility (legacy businesses without opportunities)
        const businesses = await getAllBusinessesWithBadges();

        // Create virtual opportunities for legacy businesses
        const legacyOpportunities: Opportunity[] = businesses
          .filter(biz => !opportunities.some(opp => opp.businessId === biz.businessId))
          .map(biz => ({
            id: `legacy-${biz.businessId}`,
            businessId: biz.businessId,
            businessName: biz.companyName,
            title: `Opportunity at ${biz.companyName}`,
            description: biz.potentialProblems,
            categories: biz.categories || [],
            customQuestions: biz.customQuestions,
            status: "active" as const,
            createdAt: new Date(),
            // Add legacy marker for ApplicationForm
            _isLegacy: true,
            _legacyBusiness: biz,
          } as any));

        const allOpps = [...opportunities, ...legacyOpportunities];
        setAllOpportunities(allOpps);
        setFilteredOpportunities(allOpps);
      } catch (err) {
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Fetch student's applications
  useEffect(() => {
    const fetchStudentApplications = async () => {
      if (currentUser?.uid) {
        try {
          const applications = await getApplicationsForStudent(currentUser.uid);
          setStudentApplications(applications);
        } catch (err) {
          // Silent fail
        }
      }
    };

    fetchStudentApplications();
  }, [currentUser?.uid]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allOpportunities];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((opp) => {
        return (
          opp.title.toLowerCase().includes(query) ||
          opp.businessName.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query)
        );
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((opp) => {
        if (!opp.categories || opp.categories.length === 0) return false;
        return selectedCategories.some((cat) => opp.categories.includes(cat));
      });
    }

    setFilteredOpportunities(filtered);
  }, [searchQuery, selectedCategories, allOpportunities]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setApplicationOpen(true);
  };

  const hasApplied = (opportunityId: string) => {
    // For legacy opportunities, check by businessId
    if (opportunityId.startsWith('legacy-')) {
      const businessId = opportunityId.replace('legacy-', '');
      return studentApplications.some(app => app.businessId === businessId && !app.opportunityId);
    }
    // For new opportunities, check by opportunityId
    return studentApplications.some(app => app.opportunityId === opportunityId);
  };

  const handleApplicationSuccess = async () => {
    // Refresh the student's applications after submitting a new one
    if (currentUser?.uid) {
      try {
        const applications = await getApplicationsForStudent(currentUser.uid);
        setStudentApplications(applications);
      } catch (err) {
        // Silent fail
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

  if (allOpportunities.length === 0 && !loading) {
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
                {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"} found
                {hasActiveFilters && " (filtered)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {filteredOpportunities.length === 0 ? (
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
                filteredOpportunities.map((opportunity, index) => (
                  <div
                    key={opportunity.id || `opp-${index}`}
                    className="border border-primary/20 rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all bg-card"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{opportunity.title}</h3>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{opportunity.businessName}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-primary/20 my-3" />

                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                          {opportunity.description}
                        </p>
                      </div>

                      {opportunity.categories && opportunity.categories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.categories.map((category: string) => (
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

                      {opportunity.customQuestions && opportunity.customQuestions.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{opportunity.customQuestions.length} custom question{opportunity.customQuestions.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      {hasApplied(opportunity.id!) ? (
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
                          onClick={() => handleApply(opportunity)}
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

      {selectedOpportunity && (
        <ApplicationForm
          opportunity={selectedOpportunity}
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
};

export default JobPostingsList;