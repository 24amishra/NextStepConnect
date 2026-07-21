import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CategorySelector from "@/components/CategorySelector";
import {
  Plus,
  Handshake,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  FileText,
  Loader2,
  X,
  Clock,
  Mail,
  Phone,
  User,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  getStudentPartnershipAssignments,
  getApplicationsForStudent,
  requestMatching,
  cancelMatchingRequest,
  OpportunityAssignment,
  Application,
  StudentProfile,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface MyPartnershipsProps {
  studentId: string;
  studentProfile: StudentProfile | null;
  onProfileUpdate: (updates: Partial<StudentProfile>) => void;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatDate = (value: any) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
};

const daysSince = (value: any) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  return days;
};

const MyPartnerships = ({ studentId, studentProfile, onProfileUpdate }: MyPartnershipsProps) => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<OpportunityAssignment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [assignmentData, applicationData] = await Promise.all([
          getStudentPartnershipAssignments(studentId),
          getApplicationsForStudent(studentId),
        ]);
        setAssignments(assignmentData);
        setApplications(applicationData);
      } catch (err) {
        // Silent fail — page still renders with empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const isFinished = (assignment: OpportunityAssignment) => {
    if (!assignment.applicationId) return false;
    const application = applications.find((app) => app.id === assignment.applicationId);
    return application?.status === "completed" || application?.status === "rated";
  };

  const current = assignments.filter((a) => !isFinished(a));
  const past = assignments.filter(isFinished);

  const openDialog = () => {
    setSelectedCategories(studentProfile?.matchingCategories || []);
    setNote(studentProfile?.matchingNote || "");
    setDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Pick at least one category",
        description: "This helps us find the right business for you.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await requestMatching(studentId, selectedCategories, note);
      onProfileUpdate({
        openToMatching: true,
        matchingCategories: selectedCategories,
        matchingNote: note,
        matchingRequestedAt: new Date(),
      });
      toast({
        title: "You're in!",
        description: "We'll email you as soon as we've found your next partnership.",
      });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setSubmitting(true);
      await cancelMatchingRequest(studentId);
      onProfileUpdate({ openToMatching: false });
      toast({ title: "Request cancelled", description: "You're off the matching list for now." });
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading mb-2">My Partnerships</h2>
          <p className="text-muted-foreground">Your active work, your history, and your next match.</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              onClick={openDialog}
              className={`flex-shrink-0 h-12 px-6 text-base ${
                studentProfile?.openToMatching
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/30"
                  : ""
              }`}
            >
              {studentProfile?.openToMatching ? (
                <>
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2.5 flex-shrink-0" />
                  In the matching queue
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Request a Partnership
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-center">
            {studentProfile?.openToMatching ? (
              <p>You're already on our radar — tap to see what you told us, or step back if your plans changed.</p>
            ) : (
              <p>
                This just tells us you've got the time and energy for something new. We'll start looking for a
                business that's a good fit and reach out as soon as we find one.
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Current partnership(s) */}
      {current.length > 0 ? (
        <div className="space-y-5">
          {current.map((assignment) => (
            <Card
              key={`${assignment.opportunityId || assignment.businessId}-${assignment.studentId}`}
              className="border-0 shadow-warm-lg bg-card overflow-hidden"
            >
              <div className="h-3 bg-gradient-to-r from-primary via-nextstep-ember to-primary" />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold font-heading flex-shrink-0">
                      {initialsOf(assignment.business?.companyName || "Business")}
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-0.5">
                        Active partnership
                      </p>
                      <h3 className="text-xl font-bold font-heading text-foreground">
                        {assignment.business?.companyName || "Business Partner"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.opportunity?.title || "General Partnership"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-600 text-white flex-shrink-0">Active</Badge>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  <div className="rounded-xl bg-primary/5 p-3 text-center">
                    <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground leading-none">
                      {daysSince(assignment.assignedAt)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">days together</p>
                  </div>
                  {assignment.business?.location && (
                    <div className="rounded-xl bg-primary/5 p-3 text-center">
                      <MapPin className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {assignment.business.location}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">location</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-primary/5 p-3 text-center">
                    <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {formatDate(assignment.assignedAt)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">started</p>
                  </div>
                </div>

                {(assignment.opportunity?.description || assignment.business?.potentialProblems) && (
                  <>
                    <Separator className="mb-4" />
                    <div className="mb-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Project</p>
                      <p className="text-sm text-foreground">
                        {assignment.opportunity?.description || assignment.business?.potentialProblems}
                      </p>
                    </div>
                  </>
                )}

                {(assignment.business?.contactPersonName ||
                  assignment.business?.email ||
                  assignment.contractPdfUrl) && (
                  <Collapsible>
                    <Separator className="mb-1 mt-4" />
                    <CollapsibleTrigger className="group flex items-center gap-1.5 w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                      Contact info &amp; contract
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pb-1">
                      {(assignment.business?.contactPersonName || assignment.business?.email) && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Your business contact</p>
                          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
                            {assignment.business?.contactPersonName && (
                              <div className="flex items-center gap-2 text-sm text-foreground">
                                <User className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-medium">{assignment.business.contactPersonName}</span>
                              </div>
                            )}
                            {assignment.business?.email && (
                              <a
                                href={`mailto:${assignment.business.email}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                {assignment.business.email}
                              </a>
                            )}
                            {assignment.business?.preferredContactMethod && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                {assignment.business.preferredContactMethod === "Phone" ? (
                                  <Phone className="h-3.5 w-3.5" />
                                ) : (
                                  <Mail className="h-3.5 w-3.5" />
                                )}
                                Prefers to be reached by {assignment.business.preferredContactMethod.toLowerCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {assignment.contractPdfUrl && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">Partnership contract</p>
                            <a
                              href={assignment.contractPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                            >
                              Open in new tab
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <a
                            href={assignment.contractPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/40 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">View partnership contract</p>
                              <p className="text-xs text-muted-foreground">PDF document</p>
                            </div>
                          </a>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-warm-md bg-gradient-to-br from-primary/5 to-nextstep-ember/5">
          <CardContent className="py-14 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-bold font-heading text-foreground mb-1">
              {studentProfile?.openToMatching ? "We're finding your match" : "Not paired right now"}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {studentProfile?.openToMatching
                ? "Hang tight — we'll email you the moment we've matched you with a business."
                : "Tap the + button below whenever you're ready to take on a partnership."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past partnerships */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Past partnerships
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {past.map((assignment) => (
              <div
                key={`${assignment.opportunityId || assignment.businessId}-${assignment.studentId}-past`}
                className="flex-shrink-0 w-40 rounded-xl border border-border bg-card p-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold font-heading mx-auto mb-2 relative">
                  {initialsOf(assignment.business?.companyName || "Business")}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center border-2 border-card">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {assignment.business?.companyName || "Business Partner"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">{formatDate(assignment.assignedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {studentProfile?.openToMatching ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  You're in the matching queue
                </DialogTitle>
                <DialogDescription>
                  We're actively looking for a business that fits your interests. You'll get an email the
                  moment we find your match.
                </DialogDescription>
              </DialogHeader>
              {studentProfile.matchingCategories && studentProfile.matchingCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {studentProfile.matchingCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="bg-primary/10 text-primary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              {studentProfile.matchingNote && (
                <p className="text-sm text-muted-foreground italic">"{studentProfile.matchingNote}"</p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelRequest} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Cancel request
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Ready for a partnership?</DialogTitle>
                <DialogDescription>
                  Tell us what kind of work you're interested in, and we'll find a local business that fits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">What are you interested in?</Label>
                  <CategorySelector
                    selectedCategories={selectedCategories}
                    onChange={setSelectedCategories}
                    mode="filter"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matching-note">Anything else we should know? (optional)</Label>
                  <Textarea
                    id="matching-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g. how much time you have this month, or a specific industry you're excited about..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitRequest} disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Handshake className="h-4 w-4 mr-2" />
                      Request a partnership
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPartnerships;
