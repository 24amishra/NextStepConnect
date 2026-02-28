import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getOpportunitiesForBusiness, closeOpportunity, Opportunity, getBusinessData } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import OpportunityForm from "./OpportunityForm";
import { Briefcase, Plus, Edit2, CheckCircle, FileText } from "lucide-react";

const MyOpportunities = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (currentUser?.uid) {
      fetchOpportunities();
      fetchBusinessName();
    }
  }, [currentUser]);

  const fetchBusinessName = async () => {
    if (!currentUser?.uid) return;
    try {
      const businessData = await getBusinessData(currentUser.uid);
      if (businessData) {
        setBusinessName(businessData.companyName);
      }
    } catch (error) {
      console.error("Error fetching business name:", error);
    }
  };

  const fetchOpportunities = async () => {
    if (!currentUser?.uid) return;

    setLoading(true);
    try {
      const opps = await getOpportunitiesForBusiness(currentUser.uid);
      // Sort by most recent first
      setOpportunities(opps.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      }));
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingOpportunity(null);
    setFormOpen(true);
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormOpen(true);
  };

  const handleClose = async (opportunityId: string) => {
    try {
      await closeOpportunity(opportunityId);
      toast({
        title: "Opportunity Closed",
        description: "This opportunity is no longer visible to students",
      });
      fetchOpportunities();
    } catch (error) {
      console.error("Error closing opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to close opportunity",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: Opportunity["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "closed":
        return <Badge className="bg-gray-500">Closed</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500">Draft</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <CardTitle>My Opportunities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading opportunities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <CardTitle>My Opportunities</CardTitle>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Opportunity
            </Button>
          </div>
          <CardDescription>
            Manage your job postings and track applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No opportunities yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first opportunity to start receiving applications from students
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Opportunity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                          {getStatusBadge(opportunity.status)}
                        </div>
                        <CardDescription>
                          <p className="line-clamp-2">{opportunity.description}</p>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{opportunity.applicationCount || 0} applications</span>
                        </div>
                        <div>
                          Created {formatDate(opportunity.createdAt)}
                        </div>
                        {opportunity.categories && opportunity.categories.length > 0 && (
                          <div className="flex gap-1">
                            {opportunity.categories.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {opportunity.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{opportunity.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(opportunity)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {opportunity.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClose(opportunity.id!)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunity Form Dialog */}
      <OpportunityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        businessId={currentUser?.uid || ""}
        businessName={businessName}
        opportunity={editingOpportunity || undefined}
        onSuccess={fetchOpportunities}
      />
    </>
  );
};

export default MyOpportunities;
