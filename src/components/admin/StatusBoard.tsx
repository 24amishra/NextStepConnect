import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export type PartnershipStatus = "on_hold" | "unassigned" | "past" | "assigned";

export const partnershipStatusMeta: Record<
  PartnershipStatus,
  { label: string; dot: string; badge: string }
> = {
  unassigned: { label: "New", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  past: { label: "Past Partner", dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  assigned: { label: "Current Partner", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_hold: { label: "On Hold", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
};

const COLUMN_ORDER: PartnershipStatus[] = ["unassigned", "past", "assigned", "on_hold"];

interface StatusBoardProps<T> {
  items: T[];
  getStatus: (item: T) => PartnershipStatus;
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onCardClick: (item: T) => void;
  emptyLabel: string;
}

export function StatusBoard<T>({ items, getStatus, getKey, renderCard, onCardClick, emptyLabel }: StatusBoardProps<T>) {
  const columns = COLUMN_ORDER.map((status) => ({
    status,
    items: items.filter((item) => getStatus(item) === status),
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {columns.map((column) => {
        const meta = partnershipStatusMeta[column.status];
        return (
          <div key={column.status} className="rounded-lg border border-border bg-muted/30 flex flex-col min-h-[200px]">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <p className="text-sm font-semibold text-foreground">{meta.label}</p>
              <Badge variant="secondary" className="ml-auto font-normal text-xs">
                {column.items.length}
              </Badge>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[420px]">
              {column.items.map((item) => (
                <button
                  key={getKey(item)}
                  onClick={() => onCardClick(item)}
                  className="w-full text-left rounded-md border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  {renderCard(item)}
                </button>
              ))}
              {column.items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">{emptyLabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
