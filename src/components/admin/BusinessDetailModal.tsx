import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Mail, Phone, User, Calendar, Tags, PauseCircle, PlayCircle } from "lucide-react";
import { BusinessData } from "@/lib/firestore";
import { PartnershipStatus, partnershipStatusMeta } from "./StatusBoard";

interface BusinessDetailModalProps {
  business: BusinessData | null;
  status: PartnershipStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleOnHold: (business: BusinessData) => void;
  togglingOnHold: boolean;
}

const formatDate = (value: Date | any): string => {
  if (!value) return "Unknown";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const BusinessDetailModal = ({
  business,
  status,
  open,
  onOpenChange,
  onToggleOnHold,
  togglingOnHold,
}: BusinessDetailModalProps) => {
  if (!business) return null;
  const meta = partnershipStatusMeta[status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {business.companyName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-left">{business.companyName}</DialogTitle>
              <Badge variant="outline" className={`mt-1 font-normal ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} mr-1.5`} />
                {meta.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="text-foreground">{business.industry || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-foreground">{business.location || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-foreground">{business.contactPersonName || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Signed up</p>
                <p className="text-foreground">{formatDate(business.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-foreground break-all">{business.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone · Prefers</p>
                <p className="text-foreground">
                  {business.phone || "—"} · {business.preferredContactMethod || "—"}
                </p>
              </div>
            </div>
          </div>

          {business.categories && business.categories.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Tags className="h-3.5 w-3.5" /> Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {business.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs font-normal">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {business.potentialProblems && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">What they need help with</p>
              <p className="text-sm text-foreground leading-relaxed">{business.potentialProblems}</p>
            </div>
          )}

          {status !== "assigned" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={togglingOnHold}
              onClick={() => onToggleOnHold(business)}
            >
              {status === "on_hold" ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Remove hold
                </>
              ) : (
                <>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Put on hold
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDetailModal;
