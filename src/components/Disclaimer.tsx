import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Disclaimer = () => {
  return (
    <Alert className="border-0 bg-nextstep-clay/60 shadow-warm-sm">
      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
      <AlertDescription className="text-xs sm:text-sm text-foreground/90">
      
      </AlertDescription>
    </Alert>
  );
};

export default Disclaimer;
