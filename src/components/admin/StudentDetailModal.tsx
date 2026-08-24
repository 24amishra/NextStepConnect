import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Link2, Calendar, Award, Handshake, PauseCircle, PlayCircle } from "lucide-react";
import { StudentProfile, OpportunityAssignment } from "@/lib/firestore";
import { PartnershipStatus, partnershipStatusMeta } from "./StatusBoard";

interface StudentDetailModalProps {
  student: StudentProfile | null;
  status: PartnershipStatus;
  assignment: OpportunityAssignment | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleOnHold: (student: StudentProfile) => void;
  togglingOnHold: boolean;
}

const formatDate = (value: Date | any): string => {
  if (!value) return "Unknown";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const StudentDetailModal = ({
  student,
  status,
  assignment,
  open,
  onOpenChange,
  onToggleOnHold,
  togglingOnHold,
}: StudentDetailModalProps) => {
  if (!student) return null;
  const meta = partnershipStatusMeta[status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {student.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-left">{student.name}</DialogTitle>
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
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-foreground break-all">{student.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Signed up</p>
                <p className="text-foreground">{formatDate(student.createdAt)}</p>
              </div>
            </div>
            {student.linkedinUrl && (
              <div className="flex items-start gap-2 col-span-2">
                <Link2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {student.linkedinUrl}
                  </a>
                </div>
              </div>
            )}
          </div>

          {student.skills && student.skills.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Award className="h-3.5 w-3.5" /> Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {student.desiredRoles && student.desiredRoles.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Desired roles</p>
              <div className="flex flex-wrap gap-1.5">
                {student.desiredRoles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs font-normal">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {student.bio && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Bio</p>
              <p className="text-sm text-foreground leading-relaxed">{student.bio}</p>
            </div>
          )}

          {assignment && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                <Handshake className="h-3.5 w-3.5" /> Currently matched
              </p>
              <p className="text-sm text-emerald-900 mt-1">
                {assignment.business?.companyName || "Unknown business"}
                {assignment.opportunity?.title ? ` · ${assignment.opportunity.title}` : ""}
              </p>
            </div>
          )}

          {status !== "assigned" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={togglingOnHold}
              onClick={() => onToggleOnHold(student)}
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

export default StudentDetailModal;
