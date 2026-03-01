import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Opportunity, saveApplication, CustomQuestion, getStudentProfile } from "@/lib/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface ApplicationFormProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ApplicationForm = ({ opportunity, open, onOpenChange, onSuccess }: ApplicationFormProps) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchStudentName = async () => {
      if (currentUser?.uid) {
        const profile = await getStudentProfile(currentUser.uid);
        if (profile) {
          setStudentName(profile.name);
        }
      }
    };
    fetchStudentName();
  }, [currentUser?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("You must be logged in to apply");
      return;
    }

    // Validate required custom questions
    if (opportunity.customQuestions) {
      for (const question of opportunity.customQuestions) {
        if (question.required && !answers[question.question]) {
          setError(`Please answer: ${question.question}`);
          return;
        }
      }
    }

    if (!studentName) {
      setError("Please complete your student profile before applying");
      return;
    }

    try {
      setLoading(true);

      // Check if this is a legacy opportunity (backward compatibility)
      const isLegacy = (opportunity as any)._isLegacy;

      await saveApplication({
        studentId: currentUser.uid,
        studentName: studentName,
        studentEmail: currentUser.email || "",
        businessId: opportunity.businessId,
        businessName: opportunity.businessName,
        opportunityId: isLegacy ? undefined : opportunity.id, // Don't set opportunityId for legacy
        opportunityTitle: isLegacy ? undefined : opportunity.title,
        answers,
        appliedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAnswers({});
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">{opportunity.title}</DialogTitle>
          <DialogDescription>
            {opportunity.businessName} • Submit your application below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Application submitted successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Student Information (Read-only) */}
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-foreground">Your Information</h3>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser?.email || ""} disabled className="bg-background" />
            </div>
            <div className="text-sm text-muted-foreground">
              This information will be shared with {opportunity.businessName}
            </div>
          </div>

          {/* Custom Questions */}
          {opportunity.customQuestions && opportunity.customQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Additional Questions</h3>
              {opportunity.customQuestions.map((question: CustomQuestion, index: number) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`question-${index}`}>
                    {question.question}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {question.question.toLowerCase().includes("resume") ||
                  question.question.toLowerCase().includes("portfolio") ||
                  question.question.toLowerCase().includes("link") ? (
                    <Input
                      id={`question-${index}`}
                      type="url"
                      placeholder="Enter URL"
                      value={answers[question.question] || ""}
                      onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                      required={question.required}
                      disabled={loading}
                    />
                  ) : (
                    <Textarea
                      id={`question-${index}`}
                      placeholder="Your answer..."
                      value={answers[question.question] || ""}
                      onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                      required={question.required}
                      disabled={loading}
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {(!opportunity.customQuestions || opportunity.customQuestions.length === 0) && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No additional questions required. Click submit to apply.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAnswers({});
                setError("");
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submitted!
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm;