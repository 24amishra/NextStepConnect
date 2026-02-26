import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { saveRating } from "@/lib/firestore";
import { toast } from "sonner";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  studentId: string;
  studentName: string;
  businessId: string;
  onSuccess?: () => void;
}

const RatingDialog = ({
  open,
  onOpenChange,
  applicationId,
  studentId,
  studentName,
  businessId,
  onSuccess,
}: RatingDialogProps) => {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [skillQualityRating, setSkillQualityRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const StarRating = ({
    rating,
    onChange,
    label,
  }: {
    rating: number;
    onChange: (rating: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!overallRating || !communicationRating || !professionalismRating || !skillQualityRating) {
      toast.error("Please provide all ratings");
      return;
    }

    try {
      setSubmitting(true);
      await saveRating({
        applicationId,
        studentId,
        businessId,
        overallRating,
        communicationRating,
        professionalismRating,
        skillQualityRating,
        feedback: feedback.trim() || undefined,
        projectCompletedAt: new Date(),
      });

      toast.success("Rating submitted successfully!");
      onOpenChange(false);
      if (onSuccess) onSuccess();

      // Reset form
      setOverallRating(0);
      setCommunicationRating(0);
      setProfessionalismRating(0);
      setSkillQualityRating(0);
      setFeedback("");
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Student Performance</DialogTitle>
          <DialogDescription>
            Provide feedback for {studentName}'s work on this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            rating={overallRating}
            onChange={setOverallRating}
            label="Overall Rating"
          />

          <StarRating
            rating={communicationRating}
            onChange={setCommunicationRating}
            label="Communication"
          />

          <StarRating
            rating={professionalismRating}
            onChange={setProfessionalismRating}
            label="Professionalism & Reliability"
          />

          <StarRating
            rating={skillQualityRating}
            onChange={setSkillQualityRating}
            label="Skill & Quality of Work"
          />

          <div className="space-y-2">
            <Label htmlFor="feedback">Written Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience working with this student..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
