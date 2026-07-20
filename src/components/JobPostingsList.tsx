import { useEffect, useState } from "react";
import { getAllBusinessesWithBadges, getAllActiveOpportunities, getApplicationsForStudent, Application, Opportunity } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CategorySelector from "./CategorySelector";
import {
  Briefcase,
  MapPin,
  Building2,
  FileText,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
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

  // Keep a valid opportunity selected as the list/filters change
  useEffect(() => {
    if (filteredOpportunities.length === 0) {
      setSelectedOpportunity(null);
      return;
    }
    const stillPresent = selectedOpportunity && filteredOpportunities.some((opp) => opp.id === selectedOpportunity.id);
    if (!stillPresent) {
      setSelectedOpportunity(filteredOpportunities[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOpportunities]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const handleExpressInterest = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setApplicationOpen(true);
  };

  const hasExpressedInterest = (opportunityId: string) => {
    // For legacy opportunities, check by businessId
    if (opportunityId.startsWith('legacy-')) {
      const businessId = opportunityId.replace('legacy-', '');
      return studentApplications.some(app => app.businessId === businessId && !app.opportunityId);
    }
    // For new opportunities, check by opportunityId
    return studentApplications.some(app => app.opportunityId === opportunityId);
  };

  const handleInterestSuccess = async () => {
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
      <Card className="border-0 shadow-warm-md bg-card">
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
      <Card className="border-0 shadow-warm-md bg-card">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategories.length > 0;

  if (allOpportunities.length === 0) {
    return (
      <Card className="border-0 shadow-warm-md bg-card">
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No opportunities available at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search + filter bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-shrink-0 bg-card">
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Categories</span>
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <p className="text-sm font-semibold mb-3">Filter by category</p>
              <CategorySelector
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
                mode="filter"
              />
            </PopoverContent>
          </Popover>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="flex-shrink-0">
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"} found
          {hasActiveFilters && " (filtered)"}
        </p>

        {filteredOpportunities.length === 0 ? (
          <Card className="border-0 shadow-warm-md bg-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No opportunities match your filters</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
            {/* Compact list */}
            <div className="space-y-2.5 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
              {filteredOpportunities.map((opportunity, index) => {
                const isSelected = selectedOpportunity?.id === opportunity.id;
                const interested = hasExpressedInterest(opportunity.id!);
                return (
                  <button
                    key={opportunity.id || `opp-${index}`}
                    onClick={() => setSelectedOpportunity(opportunity)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors bg-card ${
                      isSelected
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {opportunity.title}
                      </h3>
                      {interested && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {opportunity.businessName}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {opportunity.description}
                    </p>
                    {opportunity.categories && opportunity.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {opportunity.categories.slice(0, 2).map((category) => (
                          <Badge key={category} variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                            {category}
                          </Badge>
                        ))}
                        {opportunity.categories.length > 2 && (
                          <Badge variant="outline" className="text-[10px] bg-muted border-border">
                            +{opportunity.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="lg:sticky lg:top-24">
              {selectedOpportunity ? (
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h2 className="text-xl font-semibold text-foreground">{selectedOpportunity.title}</h2>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Building2 className="h-4 w-4 text-primary" />
                      {selectedOpportunity.businessName}
                    </div>

                    <Separator className="mb-4" />

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {selectedOpportunity.description}
                        </p>
                      </div>

                      {selectedOpportunity.categories && selectedOpportunity.categories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Categories</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedOpportunity.categories.map((category: string) => (
                              <Badge key={category} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedOpportunity.customQuestions && selectedOpportunity.customQuestions.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {selectedOpportunity.customQuestions.length} custom question
                          {selectedOpportunity.customQuestions.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      {hasExpressedInterest(selectedOpportunity.id!) ? (
                        <Button disabled variant="outline" className="w-full border-primary/50 text-primary">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Interest Sent
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleExpressInterest(selectedOpportunity)}
                        >
                          Express Interest
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-warm-md bg-card">
                  <CardContent className="py-16 text-center">
                    <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select an opportunity to see details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedOpportunity && (
        <ApplicationForm
          opportunity={selectedOpportunity}
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
          onSuccess={handleInterestSuccess}
        />
      )}
    </>
  );
};

export default JobPostingsList;
