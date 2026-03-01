import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createOpportunity, updateOpportunity, Opportunity, CustomQuestion } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import CategorySelector from "@/components/CategorySelector";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  opportunity?: Opportunity; // If editing
  onSuccess: () => void;
}

const OpportunityForm = ({ open, onOpenChange, businessId, businessName, opportunity, onSuccess }: OpportunityFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    categories?: string;
  }>({});

  // Populate form when editing
  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title);
      setDescription(opportunity.description);
      setCategories(opportunity.categories || []);
      setCustomQuestions(opportunity.customQuestions || []);
      setIsActive(opportunity.status === "active");
    } else {
      // Reset form when creating new
      setTitle("");
      setDescription("");
      setCategories([]);
      setCustomQuestions([]);
      setIsActive(true);
    }
    setErrors({});
  }, [opportunity, open]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if  (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

  
    if (categories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const opportunityData = {
        businessId,
        businessName,
        title: title.trim(),
        description: description.trim(),
        categories,
        status: isActive ? "active" as const : "draft" as const,
      };

      if (opportunity?.id) {
        // Update existing opportunity
        await updateOpportunity(opportunity.id, opportunityData);
        toast({
          title: "Success",
          description: "Opportunity updated successfully",
        });
      } else {
        // Create new opportunity
        await createOpportunity(opportunityData);
        toast({
          title: "Success",
          description: "Opportunity created successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to save opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomQuestion = () => {
    setCustomQuestions([...customQuestions, { question: "", required: false }]);
  };

  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: string | boolean) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Edit Opportunity" : "Create New Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Opportunity Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Social Media Marketing Assistant"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, responsibilities, and what you're looking for..."
              rows={6}
              maxLength={2000}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/2000 characters
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>
              Categories <span className="text-red-500">*</span>
            </Label>
            <CategorySelector
              selectedCategories={categories}
              onChange={setCategories}
            />
            {errors.categories && (
              <p className="text-sm text-red-500">{errors.categories}</p>
            )}
          </div>

        

          {/* Status Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="active-status"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active-status" className="cursor-pointer">
              <span className="font-medium">
                {isActive ? "Active" : "Draft"}
              </span>
              <p className="text-sm text-gray-600">
                {isActive
                  ? "Visible to students and accepting applications"
                  : "Not visible to students"}
              </p>
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : opportunity
                ? "Update Opportunity"
                : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;
