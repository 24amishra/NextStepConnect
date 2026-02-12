import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Disclaimer = () => {
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm text-foreground/90">
        <strong>Important:</strong> NextStep is a nonprofit service provider connecting students with local businesses.
        We do not sign contracts, assume liability, or manage project agreements. All arrangements are made directly
        between students and businesses.
      </AlertDescription>
    </Alert>
  );
};

export default Disclaimer;
