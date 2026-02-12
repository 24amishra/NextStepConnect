import { CATEGORIES } from "@/lib/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  disabled?: boolean;
  mode?: "edit" | "filter";
}

const CategorySelector = ({ selectedCategories, onChange, disabled = false, mode = "edit" }: CategorySelectorProps) => {
  const handleToggle = (category: string) => {
    if (disabled) return;

    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  if (mode === "filter") {
    return (
      <div className="space-y-3">
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => handleToggle(category)}
              disabled={disabled}
            />
            <Label
              htmlFor={`category-${category}`}
              className="text-sm font-normal cursor-pointer"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => handleToggle(category)}
              disabled={disabled}
            />
            <Label
              htmlFor={`category-${category}`}
              className="text-sm font-normal cursor-pointer"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-muted-foreground">Selected:</span>
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {category}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
